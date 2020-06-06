use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::database::DbConnection;
use crate::errors::{BackendError, BackendResult};
use crate::models::users::UserId;

use super::schema::nodes;

pub type NodeName = String;
pub type NodeId = i32;

pub type Path = [NodeName];
pub type OwnedPath = Vec<NodeName>;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewNodePayload {
    pub name: String,
    pub is_directory: bool,
    pub content: Option<String>,
}

#[derive(Insertable, Debug)]
#[table_name = "nodes"]
pub struct NewNode {
    pub node_name: String,

    pub parent_id: Option<NodeId>,
    pub parent_is_directory: Option<bool>,
    pub owner_id: UserId,
    pub is_directory: bool,
    pub content: Option<String>,
}

impl NewNode {
    pub fn new(
        payload: &NewNodePayload,
        parent_id: Option<&NodeId>,
        owner_id: &UserId,
    ) -> BackendResult<NewNode> {
        let node = if payload.is_directory {
            NewNode {
                node_name: payload.name.clone(),
                parent_id: match parent_id {
                    Some(id) => Some(*id),
                    None => None,
                },
                parent_is_directory: if parent_id.is_some() {
                    Some(true)
                } else {
                    None
                },
                owner_id: *owner_id,
                is_directory: true,
                content: None,
            }
        } else {
            if payload.content.is_none() {
                return Err(BackendError::InvalidValue);
            }

            NewNode {
                node_name: payload.name.clone(),
                parent_id: match parent_id {
                    Some(id) => Some(*id),
                    None => None,
                },
                parent_is_directory: if parent_id.is_some() {
                    Some(true)
                } else {
                    None
                },
                owner_id: *owner_id,
                is_directory: false,
                content: payload.content.clone(),
            }
        };

        Ok(node)
    }
}

#[derive(Identifiable, Queryable, Associations, Serialize, PartialEq, Debug)]
#[table_name = "nodes"]
#[primary_key(node_id)]
#[belongs_to(Node)]
#[serde(rename_all = "camelCase")]
pub struct Node {
    pub node_id: NodeId,
    pub node_name: NodeName,

    pub parent_id: Option<NodeId>,
    #[serde(skip_serializing)]
    pub parent_is_directory: Option<bool>,
    pub owner_id: UserId,

    pub is_directory: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
}

impl Node {
    fn fetch_id_by_path_for_user(
        conn: &DbConnection,
        user_id: &UserId,
        path: &Path,
    ) -> BackendResult<NodeId> {
        // A CTE like this would allow for this to be a one query operation:
        //   with recursive node_tree (
        //       node_id, node_name, parent_id, parent_is_directory, owner_id,
        //       is_directory, content, depth
        //   ) as (
        //       select *, 0 as depth
        //       from nodes
        //       where parent_id is null and owner_id = 1
        //       union all
        //       select nodes.*, node_tree.depth + 1 as depth
        //       from node_tree
        //           join nodes on (node_tree.node_id = nodes.parent_id)
        //       where (
        //               (depth = 0 and node_tree.node_name = 'Allgemein')
        //               or depth is not 0
        //           )
        //           and (
        //               (depth = 1 and node_tree.node_name = 'Projekte')
        //               or depth is not 1
        //           )
        //           and depth < 2 - 1
        //   )
        //   select node_id, node_name
        //   from node_tree
        //   order by depth DESC
        //   limit 1;
        //
        // Sadly CTEs or at least recursive ones are not supported by diesels
        // query builder yet: https://github.com/diesel-rs/diesel/issues/356
        // Also non fixed amount of bind values is not supported yet:
        // https://github.com/diesel-rs/diesel/issues/2103
        // Since nothing is supported to execute this query in a proper way,
        // just load each node one after another along the path.

        conn.transaction(|| {
            let mut node_id: Option<NodeId> = None;
            for part in path.iter() {
                let mut query = nodes::table
                    .select(nodes::node_id)
                    .filter(nodes::owner_id.eq(user_id))
                    .filter(nodes::node_name.eq(part))
                    .into_boxed();

                // Add the node if there is one from a previous iteration step
                // as the parent to the query.
                query = match node_id {
                    Some(parent_id) => {
                        query.filter(nodes::parent_id.eq(parent_id))
                    }
                    None => query,
                };

                node_id = Some(query.first(conn)?);
            }

            match node_id {
                Some(node_id) => Ok(node_id),
                None => Err(BackendError::NotFound),
            }
        })
    }

    /// Fetches a single node represented by the given path. The given `user_id`
    /// must be the id of the owner of that node.
    pub fn fetch_by_path_for_user(
        conn: &DbConnection,
        user_id: &UserId,
        path: &Path,
    ) -> BackendResult<Node> {
        conn.transaction(|| {
            let node_id = Self::fetch_id_by_path_for_user(conn, user_id, path)?;
            let node = nodes::table
                .filter(nodes::owner_id.eq(user_id))
                .filter(nodes::node_id.eq(node_id))
                .first::<Node>(conn)?;
            Ok(node)
        })
    }

    /// Fetches all nodes that are owned by the user associated to the given
    /// `user_id`.
    pub fn fetch_all_for_user(
        conn: &DbConnection,
        user_id: &UserId,
    ) -> BackendResult<Vec<Node>> {
        let nodes = nodes::table
            .filter(nodes::owner_id.eq(user_id))
            .get_results::<Node>(conn)?;
        Ok(nodes)
    }

    /// Inserts a new node into the database. An empty `parent_path` means the
    /// node will be added as a root node. Returns the new node.
    pub fn insert(
        conn: &DbConnection,
        owner_id: &UserId,
        parent_path: &Path,
        payload: &NewNodePayload,
    ) -> BackendResult<Node> {
        conn.transaction::<_, BackendError, _>(|| {
            let parent_id = if parent_path.is_empty() {
                // New root node.
                None
            } else {
                // Load parent node id.
                let parent_id = Node::fetch_id_by_path_for_user(
                    &conn,
                    owner_id,
                    &parent_path,
                )?;
                Some(parent_id)
            };
            let new_node_data =
                NewNode::new(payload, parent_id.as_ref(), owner_id)?;
            diesel::insert_into(nodes::table)
                .values(new_node_data)
                .execute(conn)?;
            let mut new_node_path = parent_path.to_vec();
            new_node_path.push(payload.name.clone());
            let new_node =
                Self::fetch_by_path_for_user(conn, owner_id, &new_node_path)?;

            Ok(new_node)
        })
    }

    /// Changes the content of this node. Returns a new node instance with the
    /// updated content value. Returns `BackendError::InvalidValue` error if
    /// this node is a directory.
    pub fn change_content(
        self,
        conn: &DbConnection,
        new_content: &str,
    ) -> BackendResult<Node> {
        if self.is_directory {
            return Err(BackendError::InvalidValue);
        }

        let count = diesel::update(&self)
            .set(nodes::content.eq(new_content))
            .execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(Node {
            content: Some(String::from(new_content)),
            ..self
        })
    }

    /// Changes the name of this node. Returns a new node instance with the
    /// updated name value.
    pub fn change_name(
        self,
        conn: &DbConnection,
        new_name: &str,
    ) -> BackendResult<Node> {
        let count = diesel::update(&self)
            .set(nodes::node_name.eq(new_name))
            .execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(Node {
            node_name: String::from(new_name),
            ..self
        })
    }

    /// Deletes this node from the database.
    pub fn delete(self, conn: &DbConnection) -> BackendResult<()> {
        let count = diesel::delete(&self).execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(())
    }
}
