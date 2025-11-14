import { Subject } from 'rxjs';
const dashboardTransactionSub=new Subject();
const publishTransactionRefresh=()=>dashboardTransactionSub.next();
export {  publishTransactionRefresh, dashboardTransactionSub}