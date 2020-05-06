use diesel::prelude::*;
use rocket::{self, delete, get, post, put, State};
use rocket_contrib::json::Json;
use serde::Deserialize;

use crate::models::{
    NewNotebook, NewPage, NewSection, Notebook, Page, PagePath, PagesTree,
    Section,
};
use crate::{jwt, BackendError, BackendResult, DbConnectionPool};

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateNotebookPayload<'a> {
    notebook_title: &'a str,
}

#[post("/notebook", data = "<payload>")]
pub fn create_notebook(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    payload: Json<CreateNotebookPayload>,
) -> BackendResult<Json<Notebook>> {
    let conn = pool.get()?;
    let notebook = Notebook::create(
        &conn,
        &NewNotebook {
            notebook_title: payload.notebook_title,
            user_id: claims.id(),
        },
    )?;
    Ok(Json(notebook))
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ModifyNotebookPayload {
    notebook_title: Option<String>,
}

#[put("/notebook/<notebook_title>", data = "<payload>")]
pub fn modify_notebook(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
    payload: Json<ModifyNotebookPayload>,
) -> BackendResult<Json<Notebook>> {
    let conn = pool.get()?;
    let result = conn.transaction::<_, BackendError, _>(|| {
        let notebook = Notebook::load_for_user_by_title(
            &conn,
            claims.id(),
            &notebook_title,
        )?;

        // Set the title if specified in the payload.
        let notebook = match &payload.notebook_title {
            Some(notebook_title) => {
                notebook.set_title(&conn, &notebook_title)?
            }
            None => notebook,
        };

        Ok(notebook)
    })?;

    Ok(Json(result))
}

#[delete("/notebook/<notebook_title>")]
pub fn delete_notebook(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
) -> BackendResult<()> {
    let conn = pool.get()?;
    conn.transaction(|| {
        let notebook = Notebook::load_for_user_by_title(
            &conn,
            claims.id(),
            &notebook_title,
        )?;
        notebook.delete(&conn)
    })
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateSectionPayload<'a> {
    section_title: &'a str,
}

#[post("/notebook/<notebook_title>/section", data = "<payload>")]
pub fn create_section(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
    payload: Json<CreateSectionPayload>,
) -> BackendResult<Json<Section>> {
    let conn = pool.get()?;
    conn.transaction(|| {
        let notebook = Notebook::load_for_user_by_title(
            &conn,
            claims.id(),
            &notebook_title,
        )?;
        let section = Section::create(
            &conn,
            &NewSection {
                notebook_id: notebook.notebook_id,
                section_title: payload.section_title,
            },
        )?;
        Ok(Json(section))
    })
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ModifySectionPayload {
    section_title: Option<String>,
}

#[put(
    "/notebook/<notebook_title>/section/<section_title>",
    data = "<payload>"
)]
pub fn modify_section(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
    section_title: String,
    payload: Json<ModifySectionPayload>,
) -> BackendResult<Json<Section>> {
    let conn = pool.get()?;
    let result = conn.transaction::<_, BackendError, _>(|| {
        let section = Section::load_for_user_by_path(
            &conn,
            claims.id(),
            &notebook_title,
            &section_title,
        )?;

        // Set the title if specified in the payload.
        let section = match &payload.section_title {
            Some(section_title) => section.set_title(&conn, &section_title)?,
            None => section,
        };

        Ok(section)
    })?;

    Ok(Json(result))
}

#[delete("/notebook/<notebook_title>/section/<section_title>")]
pub fn delete_section(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
    section_title: String,
) -> BackendResult<()> {
    let conn = pool.get()?;
    conn.transaction(|| {
        let section = Section::load_for_user_by_path(
            &conn,
            claims.id(),
            &notebook_title,
            &section_title,
        )?;
        section.delete(&conn)
    })
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreatePagePayload<'a> {
    page_title: &'a str,
    content: &'a str,
}

#[post(
    "/notebook/<notebook_title>/section/<section_title>/page",
    data = "<payload>"
)]
pub fn create_page(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
    section_title: String,
    payload: Json<CreatePagePayload>,
) -> BackendResult<Json<Page>> {
    let conn = pool.get()?;
    conn.transaction(|| {
        let notebook = Notebook::load_for_user_by_title(
            &conn,
            claims.id(),
            &notebook_title,
        )?;
        let section = Section::load_for_notebook_with_title(
            &conn,
            notebook.notebook_id,
            &section_title,
        )?;
        let page = Page::create(
            &conn,
            &NewPage {
                section_id: section.section_id,
                page_title: &payload.page_title,
                content: &payload.content,
            },
        )?;
        Ok(Json(page))
    })
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ModifyPagePayload {
    page_title: Option<String>,
    content: Option<String>,
}

#[put(
    "/notebook/<notebook_title>/section/<section_title>/page/<page_title>",
    data = "<payload>"
)]
pub fn modify_page(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
    section_title: String,
    page_title: String,
    payload: Json<ModifyPagePayload>,
) -> BackendResult<Json<Page>> {
    let conn = pool.get()?;
    let result = conn.transaction::<_, BackendError, _>(|| {
        let page = Page::load_for_user_by_path(
            &conn,
            claims.id(),
            &PagePath {
                notebook_title: &notebook_title,
                section_title: &section_title,
                page_title: &page_title,
            },
        )?;

        // Set new content and title if new values are specified in the payload.
        // Otherwise do nothing.
        let page = match &payload.content {
            Some(new_content) => page.set_content(&conn, new_content)?,
            None => page,
        };
        let page = match &payload.page_title {
            Some(new_title) => page.set_title(&conn, new_title)?,
            None => page,
        };
        Ok(page)
    })?;

    Ok(Json(result))
}

#[delete(
    "/notebook/<notebook_title>/section/<section_title>/page/<page_title>"
)]
pub fn delete_page(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
    notebook_title: String,
    section_title: String,
    page_title: String,
) -> BackendResult<()> {
    let conn = pool.get()?;
    conn.transaction(|| {
        let page = Page::load_for_user_by_path(
            &conn,
            claims.id(),
            &PagePath {
                notebook_title: &notebook_title,
                section_title: &section_title,
                page_title: &page_title,
            },
        )?;
        page.delete(&conn)
    })
}

#[get("/notebook")]
pub fn fetch_notebooks(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
) -> BackendResult<Json<PagesTree>> {
    let conn = pool.get()?;
    let result = PagesTree::fetch_for_user(&conn, claims.id())?;

    Ok(Json(result))
}
