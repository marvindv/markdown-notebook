import { DragObjectWithType } from 'react-dnd';
import { Path } from 'src/models/node';

export interface NodeDragObject extends DragObjectWithType {
  name: string;
  path: Path;
}
