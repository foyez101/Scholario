import NameListManager from '../../../components/NameListManager';

export default function AdminSubjectsPage() {
  return <NameListManager endpoint="/admin/subjects" responseKey="subjects" itemLabel="Subject" />;
}
