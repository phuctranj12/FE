import React from 'react';
import SearchBar from '../common/SearchBar';
import OrganizationList from './OrganizationList';
import UserList from './UserList';
import RoleList from './RoleList';

const UserManagement = ({ selectedStatus }) => {
    const renderComponent = () => {
        switch (selectedStatus) {
            case 'to-chuc':
                return <OrganizationList />;
            case 'nguoi-dung':
                return <UserList />;
            case 'vai-tro':
                return <RoleList />;
            default:
                return <OrganizationList />;
        }
    };
    
    return (
        <div className="user-management-wrapper">
            {renderComponent()}
        </div>
    );
};

export default UserManagement;
