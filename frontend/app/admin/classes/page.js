import NameListManager from '../../../components/NameListManager';

export default function AdminClassesPage() {
  return <NameListManager endpoint="/admin/classes" responseKey="classes" itemLabel="Class" />;
}
