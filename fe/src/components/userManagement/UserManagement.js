import React, { useState, useEffect } from 'react';
import SearchBar from '../common/SearchBar';
import OrganizationList from './OrganizationList';
import UserList from './UserList';
import RoleList from './RoleList';
import AddNewUser from './AddNewUser';

const UserManagement = ({ selectedStatus }) => {
    const [showAddUser, setShowAddUser] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [mode, setMode] = useState('create');

    // Reset showAddUser when selectedStatus changes
    useEffect(() => {
        setShowAddUser(false);
        setEditUser(null);
        setMode('create');
    }, [selectedStatus]);

    const renderComponent = () => {
        if (showAddUser) {
            return (
                <AddNewUser 
                    onCancel={() => { setShowAddUser(false); setEditUser(null); setMode('create'); }}
                    mode={mode}
                    initialUser={editUser}
                />
            );
        }
        
        switch (selectedStatus) {
            case 'to-chuc':
                return <OrganizationList />;
            case 'nguoi-dung':
                return (
                    <UserList 
                        onAddNew={() => { setMode('create'); setEditUser(null); setShowAddUser(true); }}
                        onEdit={(user) => { setMode('edit'); setEditUser(user); setShowAddUser(true); }}
                    />
                );
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
