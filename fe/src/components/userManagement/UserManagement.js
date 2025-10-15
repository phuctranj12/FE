import React, { useState, useEffect } from 'react';
import SearchBar from '../common/SearchBar';
import OrganizationList from './OrganizationList';
import UserList from './UserList';
import RoleList from './RoleList';
import AddNewUser from './AddNewUser';

const UserManagement = ({ selectedStatus }) => {
    const [showAddUser, setShowAddUser] = useState(false);

    // Reset showAddUser when selectedStatus changes
    useEffect(() => {
        setShowAddUser(false);
    }, [selectedStatus]);

    const renderComponent = () => {
        if (showAddUser) {
            return <AddNewUser onCancel={() => setShowAddUser(false)} />;
        }
        
        switch (selectedStatus) {
            case 'to-chuc':
                return <OrganizationList />;
            case 'nguoi-dung':
                return <UserList onAddNew={() => setShowAddUser(true)} />;
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
