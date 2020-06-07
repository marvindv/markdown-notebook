use diesel::prelude::*;
use rocket::{self, delete, get, post, put, State};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

use crate::models::{NewNodePayload, Node, OwnedPath};
use crate::{jwt, BackendError, BackendResult, DbConnectionPool};

#[get("/node")]
pub fn get_nodes(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
) -> BackendResult<Json<Vec<Node>>> {
    let conn = pool.get()?;
    let nodes = Node::fetch_all_for_user(&conn, &claims.id())?;
    Ok(Json(nodes))
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateNodePayload {
    parent: OwnedPath,
    node: NewNodePayload,
}

#[post("/node", data = "<payload>")]
pub fn create_node(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    payload: Json<CreateNodePayload>,
) -> BackendResult<Json<Node>> {
    let conn = pool.get()?;
    let node =
        Node::insert(&conn, &claims.id(), &payload.parent, &payload.node)?;
    Ok(Json(node))
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ChangeNodeContent {
    path: OwnedPath,
    new_content: String,
}

#[put("/node/content", data = "<payload>")]
pub fn change_content(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    payload: Json<ChangeNodeContent>,
) -> BackendResult<Json<Node>> {
    let conn = &pool.get()?;
    let node = Node::fetch_by_path_for_user(conn, &claims.id(), &payload.path)?;
    let node = node.change_content(conn, &payload.new_content)?;
    Ok(Json(node))
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ChangeNodeName<'a> {
    path: OwnedPath,
    new_name: &'a str,
}

#[put("/node/name", data = "<payload>")]
pub fn change_name(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    payload: Json<ChangeNodeName>,
) -> BackendResult<Json<Node>> {
    let conn = &pool.get()?;
    let node = Node::fetch_by_path_for_user(conn, &claims.id(), &payload.path)?;
    let node = node.change_name(conn, payload.new_name)?;
    Ok(Json(node))
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ChangeParentPayload {
    node_path: OwnedPath,
    new_parent_path: OwnedPath,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ChangeParentResponse {
    old_path: OwnedPath,
    new_path: OwnedPath,
}

#[put("/node/parent", data = "<payload>")]
pub fn change_parent(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    payload: Json<ChangeParentPayload>,
) -> BackendResult<Json<ChangeParentResponse>> {
    let conn = pool.get()?;
    let response = conn.transaction::<_, BackendError, _>(|| {
        let node = Node::fetch_by_path_for_user(
            &conn,
            &claims.id(),
            &payload.node_path,
        )?;

        let new_parent = if payload.new_parent_path.is_empty() {
            None
        } else {
            Some(Node::fetch_by_path_for_user(
                &conn,
                &claims.id(),
                &payload.new_parent_path,
            )?)
        };

        let new_node = node.change_parent(&conn, new_parent.as_ref())?;
        let mut new_path = payload.new_parent_path.clone();
        new_path.extend(vec![new_node.node_name]);

        Ok(ChangeParentResponse {
            old_path: payload.node_path.clone(),
            new_path,
        })
    })?;

    Ok(Json(response))
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DeleteNode {
    path: OwnedPath,
}

#[delete("/node", data = "<payload>")]
pub fn delete(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    payload: Json<DeleteNode>,
) -> BackendResult<()> {
    let conn = &pool.get()?;
    let node = Node::fetch_by_path_for_user(conn, &claims.id(), &payload.path)?;
    node.delete(conn)?;
    Ok(())
}
