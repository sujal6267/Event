import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+977 9800000000',
    location: user?.location || 'Kathmandu, Nepal'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, update user via API
    setIsEditing(false);
    // Force visualization update
    alert('Profile updated successfully (Mock)');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'secondary' : 'primary'}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center pt-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-indigo-600" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 shadow-md">
                    <Camera size={16} />
                  </button>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 capitalize">{user?.role}</p>
              
              <div className="w-full mt-6 border-t border-gray-100 pt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-3" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-3" />
                  <span className="text-sm">{formData.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-3" />
                  <span className="text-sm">{formData.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="bg-gray-50"
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit">Save Changes</Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
