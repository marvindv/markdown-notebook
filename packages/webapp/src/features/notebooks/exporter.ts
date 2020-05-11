import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import Notebook from 'src/models/notebook';

/**
 * Generates a zip file containing all notebooks with their sections as
 * directories with their pages as markdown files inside them. The generated
 * file will be saved as a download.
 *
 * @export
 * @param {Notebook[]} notebooks
 */
export default async function exportAsZip(notebooks: Notebook[]) {
  const zip = new JSZip();

  for (const notebook of notebooks) {
    const notebookFolder = zip.folder(notebook.title);

    for (const section of notebook.sections) {
      const sectionFolder = notebookFolder.folder(section.title);

      for (const page of section.pages) {
        sectionFolder.file(page.title + '.md', page.content);
      }
    }
  }

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'notebooks.zip');
  } catch (err) {
    toast.error('Failed to export: ' + err.toString());
  }
}
