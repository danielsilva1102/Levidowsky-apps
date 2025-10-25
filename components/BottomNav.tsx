
import React from 'react';
import { Tab } from '../types';
import { Icon } from './Icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  tabName: Tab;
  label: string;
  activeTab: Tab;
  onClick: (tab: Tab) => void;
}> = ({ tabName, label, activeTab, onClick }) => {
  const isActive = activeTab === tabName;
  return (
    <button
      onClick={() => onClick(tabName)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-dusty-rose' : 'text-graphite/70 dark:text-graphite-light/70'
      }`}
    >
      <Icon type={tabName} className="w-7 h-7 mb-1" />
      <span className={`text-xs font-medium ${isActive ? 'text-dusty-rose' : ''}`}>{label}</span>
    </button>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 pb-4 bg-transparent">
      <div className="mx-auto max-w-md h-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50">
        <div className="flex justify-around items-center h-full">
          <NavItem tabName="inventory" label="Peças" activeTab={activeTab} onClick={setActiveTab} />
          <NavItem tabName="sales" label="Vendas" activeTab={activeTab} onClick={setActiveTab} />
          <NavItem tabName="results" label="Resultados" activeTab={activeTab} onClick={setActiveTab} />
          <NavItem tabName="settings" label="Ajustes" activeTab={activeTab} onClick={setActiveTab} />
        </div>
      </div>
    </div>
  );
};
