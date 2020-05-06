use diesel::prelude::*;
use serde::Serialize;

use super::schema::{notebooks, pages, sections};
use super::users::{User, UserId};
use crate::{BackendError, BackendResult, DbConnection};

#[derive(Insertable, Debug)]
#[table_name = "notebooks"]
pub struct NewNotebook<'a> {
    pub notebook_title: &'a str,
    pub user_id: UserId,
}

#[derive(Identifiable, Queryable, Associations, Serialize, PartialEq, Debug)]
#[table_name = "notebooks"]
#[primary_key(notebook_id)]
#[belongs_to(User)]
#[serde(rename_all = "camelCase")]
pub struct Notebook {
    pub notebook_id: i32,
    pub notebook_title: String,
    pub user_id: UserId,
}

impl Notebook {
    pub fn load_for_user_by_title(
        conn: &DbConnection,
        user_id: UserId,
        title: &str,
    ) -> BackendResult<Notebook> {
        let notebook = notebooks::table
            .filter(notebooks::user_id.eq(user_id))
            .filter(notebooks::notebook_title.eq(title))
            .first::<Notebook>(conn)?;
        Ok(notebook)
    }

    pub fn load_for_user(
        conn: &DbConnection,
        user_id: UserId,
    ) -> BackendResult<Vec<Notebook>> {
        let notebooks = notebooks::table
            .filter(notebooks::user_id.eq(user_id))
            .get_results::<Notebook>(conn)?;
        Ok(notebooks)
    }

    pub fn create<'a>(
        conn: &DbConnection,
        data: &NewNotebook<'a>,
    ) -> BackendResult<Notebook> {
        conn.transaction(|| {
            diesel::insert_into(notebooks::table)
                .values(data)
                .execute(conn)?;
            let notebook = Notebook::load_for_user_by_title(
                conn,
                data.user_id,
                data.notebook_title,
            )?;
            Ok(notebook)
        })
    }

    pub fn set_title(
        self,
        conn: &DbConnection,
        new_title: &str,
    ) -> BackendResult<Notebook> {
        let count = diesel::update(&self)
            .set(notebooks::notebook_title.eq(new_title))
            .execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(Notebook {
            notebook_title: String::from(new_title),
            ..self
        })
    }

    pub fn delete(self, conn: &DbConnection) -> BackendResult<()> {
        let count = diesel::delete(&self).execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(())
    }
}

#[derive(Insertable, Debug)]
#[table_name = "sections"]
pub struct NewSection<'a> {
    pub section_title: &'a str,
    pub notebook_id: i32,
}

#[derive(Identifiable, Queryable, Associations, Serialize, PartialEq, Debug)]
#[table_name = "sections"]
#[primary_key(section_id)]
#[belongs_to(Notebook)]
#[serde(rename_all = "camelCase")]
pub struct Section {
    pub section_id: i32,
    pub section_title: String,
    pub notebook_id: i32,
}

impl Section {
    pub fn load_for_notebook_with_title(
        conn: &DbConnection,
        notebook_id: i32,
        section_title: &str,
    ) -> BackendResult<Section> {
        let section = sections::table
            .filter(sections::notebook_id.eq(notebook_id))
            .filter(sections::section_title.eq(section_title))
            .first::<Section>(conn)?;
        Ok(section)
    }

    pub fn load_for_user_by_path(
        conn: &DbConnection,
        user_id: UserId,
        notebook_title: &str,
        section_title: &str,
    ) -> BackendResult<Section> {
        conn.transaction(|| {
            let notebook = Notebook::load_for_user_by_title(
                conn,
                user_id,
                notebook_title,
            )?;
            Self::load_for_notebook_with_title(
                conn,
                notebook.notebook_id,
                section_title,
            )
        })
    }

    pub fn create<'a>(
        conn: &DbConnection,
        data: &NewSection<'a>,
    ) -> BackendResult<Section> {
        conn.transaction(|| {
            diesel::insert_into(sections::table)
                .values(data)
                .execute(conn)?;
            let section = Section::load_for_notebook_with_title(
                conn,
                data.notebook_id,
                data.section_title,
            )?;
            Ok(section)
        })
    }

    pub fn set_title(
        self,
        conn: &DbConnection,
        new_title: &str,
    ) -> BackendResult<Section> {
        let count = diesel::update(&self)
            .set(sections::section_title.eq(new_title))
            .execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(Section {
            section_title: String::from(new_title),
            ..self
        })
    }

    pub fn delete(self, conn: &DbConnection) -> BackendResult<()> {
        let count = diesel::delete(&self).execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(())
    }
}

#[derive(Insertable, Debug)]
#[table_name = "pages"]
pub struct NewPage<'a> {
    pub page_title: &'a str,
    pub section_id: i32,
    pub content: &'a str,
}

#[derive(Identifiable, Queryable, Associations, Serialize, PartialEq, Debug)]
#[table_name = "pages"]
#[primary_key(page_id)]
#[belongs_to(Section)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub page_id: i32,
    pub page_title: String,
    pub content: String,
    pub section_id: i32,
}

pub struct PagePath<'a> {
    pub notebook_title: &'a str,
    pub section_title: &'a str,
    pub page_title: &'a str,
}

impl Page {
    pub fn load_for_section_with_title(
        conn: &DbConnection,
        section_id: i32,
        page_title: &str,
    ) -> BackendResult<Page> {
        let page = pages::table
            .filter(pages::section_id.eq(section_id))
            .filter(pages::page_title.eq(page_title))
            .first::<Page>(conn)?;
        Ok(page)
    }

    pub fn load_for_user_by_path(
        conn: &DbConnection,
        user_id: UserId,
        path: &PagePath,
    ) -> BackendResult<Page> {
        let notebook = Notebook::load_for_user_by_title(
            conn,
            user_id,
            path.notebook_title,
        )?;
        let section = Section::load_for_notebook_with_title(
            conn,
            notebook.notebook_id,
            path.section_title,
        )?;
        let page = Page::load_for_section_with_title(
            conn,
            section.section_id,
            path.page_title,
        )?;
        Ok(page)
    }

    pub fn create<'a>(
        conn: &DbConnection,
        data: &NewPage<'a>,
    ) -> BackendResult<Page> {
        conn.transaction(|| {
            diesel::insert_into(pages::table)
                .values(data)
                .execute(conn)?;
            let page = Page::load_for_section_with_title(
                conn,
                data.section_id,
                &data.page_title,
            )?;
            Ok(page)
        })
    }

    pub fn set_content(
        self,
        conn: &DbConnection,
        new_content: &str,
    ) -> BackendResult<Page> {
        let count = diesel::update(&self)
            .set(pages::content.eq(new_content))
            .execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(Page {
            content: String::from(new_content),
            ..self
        })
    }

    pub fn set_title(
        self,
        conn: &DbConnection,
        new_title: &str,
    ) -> BackendResult<Page> {
        let count = diesel::update(&self)
            .set(pages::page_title.eq(new_title))
            .execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(Page {
            page_title: String::from(new_title),
            ..self
        })
    }

    pub fn delete(self, conn: &DbConnection) -> BackendResult<()> {
        let count = diesel::delete(&self).execute(conn)?;
        if count == 0 {
            return Err(BackendError::NotFound);
        }

        Ok(())
    }
}

/// The PagesTree represents the notebook-section-pages data structure to be
/// used for the http api.
/// Serialized as json, It consists of an array of objects containing a
/// notebook title and a list of sections. Each section is an object containing
/// the section title as well as a list of pages in that section. It follows
/// this typescript type description:
///
/// ```ignore
/// type PagesTree = {
///   title: string,
///   sections: {
///     title: string,
///     pages: {
///       title: string,
///       content: string
///     }[]
///   }[]
/// }[]
/// ```
#[derive(Serialize, PartialEq, Debug)]
pub struct PagesTree(pub Vec<PagesTreeNotebook>);

// TODO: There is probably a more elegant way of implementing this.
impl PagesTree {
    fn construct(
        source: &[(Notebook, Vec<(Section, Vec<Page>)>)],
    ) -> PagesTree {
        let result = source
            .iter()
            .map(|(notebook, sections)| PagesTreeNotebook {
                title: notebook.notebook_title.clone(),
                sections: sections
                    .iter()
                    .map(|(section, pages)| PagesTreeSection {
                        title: section.section_title.clone(),
                        pages: pages
                            .iter()
                            .map(|page| PagesTreePage {
                                title: page.page_title.clone(),
                                content: page.content.clone(),
                            })
                            .collect(),
                    })
                    .collect(),
            })
            .collect();

        PagesTree(result)
    }

    pub fn fetch_for_user(
        conn: &DbConnection,
        user_id: UserId,
    ) -> BackendResult<PagesTree> {
        // Based on the long af example on
        // https://docs.diesel.rs/diesel/associations/index.html
        let notebooks = Notebook::load_for_user(conn, user_id)?;
        let sections =
            Section::belonging_to(&notebooks).load::<Section>(conn)?;
        let pages = Page::belonging_to(&sections).load::<Page>(conn)?;
        let grouped_pages = pages.grouped_by(&sections);
        let sections_with_pages: Vec<(Section, Vec<Page>)> =
            sections.into_iter().zip(grouped_pages).collect();
        let grouped_sections = sections_with_pages.grouped_by(&notebooks);
        let notebooks_with_sections: Vec<(
            Notebook,
            Vec<(Section, Vec<Page>)>,
        )> = notebooks.into_iter().zip(grouped_sections).collect();
        let tree = PagesTree::construct(&notebooks_with_sections);
        Ok(tree)
    }
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PagesTreeNotebook {
    pub title: String,
    pub sections: Vec<PagesTreeSection>,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PagesTreeSection {
    pub title: String,
    pub pages: Vec<PagesTreePage>,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PagesTreePage {
    pub title: String,
    pub content: String,
}
