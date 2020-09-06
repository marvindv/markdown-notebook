import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import { DirectoryNode, Node } from 'src/models/node';

/**
 * Generates a zip file containing all note files in the directory structure as
 * specified by the given root directory node. The generated file will be saved
 * as a download.
 *
 * @export
 * @param {DirectoryNode} root
 */
export default async function exportAsZip(root: DirectoryNode) {
  const zip = new JSZip();
  processNode(zip, root, true);

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'notebook.zip');
  } catch (err) {
    toast.error('Failed to export: ' + err.toString());
  }
}

function processNode(parent: JSZip, node: Node, isRoot: boolean) {
  if (node.isDirectory) {
    const folder = isRoot ? parent : parent.folder(node.name);
    for (const child of Object.keys(node.children)) {
      processNode(folder, node.children[child], false);
    }
  } else {
    parent.file(node.name + '.md', node.content);
  }
}
