
import { useState } from 'react';
import { Layout } from '../components/common/Layout';
import { Tabs } from '../components/common/Tabs';
import { DailySales } from '../components/data/DailySales';
import { ExhibitionConfig } from '../components/data/ExhibitionConfig';
import { ParticipantRegistration } from '../components/data/ParticipantRegistration';
import { RegistrationViewer } from '../components/data/RegistrationViewer';
import { TrendingUp, Settings, UserPlus, Users } from 'lucide-react';

export const Data = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    {
      id: 'sales',
      label: 'Daily Sales',
      icon: TrendingUp,
      component: DailySales,
    },
    {
      id: 'config',
      label: 'Exhibition Config',
      icon: Settings,
      component: ExhibitionConfig,
    },
    {
      id: 'registration',
      label: 'Participant Registration',
      icon: UserPlus,
      component: ParticipantRegistration,
    },
    {
      id: 'viewers',
      label: 'Registration Viewer',
      icon: Users,
      component: RegistrationViewer,
    },
  ];

  return (
    <Layout 
      title="Data Analytics"
      subtitle="View comprehensive analytics and manage exhibition data"
      backgroundGradient="from-indigo-50 to-blue-50 dark:from-dark-900 dark:to-dark-800"
    >
      <div className="max-w-7xl mx-auto">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </Layout>
  );
};
