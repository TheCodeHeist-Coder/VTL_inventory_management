import { use } from "react";
import DashboardPage from "./DashboardPage";
import UsersPage from "./UsersPage";
import StatesPage from "./StatesPage";
import DistrictsPage from "./DistrictsPage";
import SitesPage from "./SitesPage";
import InventoriesPage from "./InventoriesPage";
import RequestsPage from "./RequestsPage";
import Layout from "../../../components/Layout";
import { NavItem } from "../../../types";



const navItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/states', label: 'States', icon: '🏠️' },
    { path: '/admin/districts', label: 'Districts & Blocks', icon: '🗺️' },
    { path: '/admin/sites', label: 'Sites', icon: '🏗️' },
    { path: '/admin/inventories', label: 'Inventories', icon: '🏪' },
    { path: '/admin/requests', label: 'All Requests', icon: '📦' },
];


export default function AdminDashBoard({params}: {params: Promise<{slug?: string[]}>}) {
  const {slug = []} = use(params);

  const path = slug[0] || '';

  const renderPage = () => {
    switch (path) {
        case '': return <DashboardPage />;
        case 'users': return <UsersPage />;
        case 'states': return <StatesPage />;
        case 'districts': return <DistrictsPage />;
        case 'sites': return <SitesPage />;
        case 'inventories': return <InventoriesPage />;
        case 'requests': return <RequestsPage />;
        default: return <DashboardPage />;
    }
  };

  return <Layout navItems={navItems}> {renderPage()} </Layout>
}