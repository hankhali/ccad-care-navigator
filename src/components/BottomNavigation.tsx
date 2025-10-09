import { useState } from "react";
import { Home, History, Heart, Stethoscope, CreditCard, Bell, Pill, Video, Shield } from "lucide-react";
import "./BottomNavigation.css";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'health', icon: Heart, label: 'Health' },
    { id: 'care', icon: Stethoscope, label: 'Care' },
    { id: 'more', icon: CreditCard, label: 'More' }
  ];

  const moreTabs = [
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'pharmacy', icon: Pill, label: 'Pharmacy' },
    { id: 'telehealth', icon: Video, label: 'Telehealth' },
    { id: 'insurance', icon: Shield, label: 'Insurance' }
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'more') {
      setShowMoreMenu(!showMoreMenu);
    } else {
      setShowMoreMenu(false);
      onTabChange(tabId);
    }
  };

  const handleMoreItemClick = (tabId: string) => {
    setShowMoreMenu(false);
    onTabChange(tabId);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="more-menu-overlay" onClick={() => setShowMoreMenu(false)}>
          <div className="more-menu" onClick={(e) => e.stopPropagation()}>
            <div className="more-menu-header">
              <h3>More Features</h3>
              <button onClick={() => setShowMoreMenu(false)} className="close-more-btn">×</button>
            </div>
            <div className="more-menu-items">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleMoreItemClick(tab.id)}
                    className={`more-menu-item ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon size={24} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-navigation">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'more' && moreTabs.some(t => t.id === activeTab));
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="nav-label">{tab.label}</span>
              {tab.id === 'more' && showMoreMenu && <div className="more-indicator" />}
            </button>
          );
        })}
      </div>
    </>
  );
}
