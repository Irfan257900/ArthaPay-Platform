import { Subject } from 'rxjs'
const mainSubject = new Subject();
const actionSubject = new Subject();
const excellExportSubject = new Subject();
const publish = data => mainSubject.next(data);
const onExcellExport = () => excellExportSubject.next();
const publishShowActions = data => actionSubject.next(data);
export { mainSubject, publish, actionSubject, publishShowActions,excellExportSubject,onExcellExport }