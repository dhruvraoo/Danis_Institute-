import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import FacultyRegistrationForm from './FacultyRegistrationForm';
import PrincipalRegistrationForm from './PrincipalRegistrationForm';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('faculty');
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [showPrincipalForm, setShowPrincipalForm] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="faculty" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faculty">Faculty Management</TabsTrigger>
          <TabsTrigger value="principal">Principal Management</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Faculty Management
                <Button 
                  onClick={() => setShowFacultyForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add New Faculty
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showFacultyForm ? (
                <FacultyRegistrationForm 
                  onClose={() => setShowFacultyForm(false)}
                  onSuccess={() => {
                    setShowFacultyForm(false);
                    // Refresh faculty list
                  }}
                />
              ) : (
                // Faculty list will go here
                <div className="space-y-4">
                  {/* Faculty list component */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="principal">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Principal Management
                <Button 
                  onClick={() => setShowPrincipalForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add New Principal
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showPrincipalForm ? (
                <PrincipalRegistrationForm 
                  onClose={() => setShowPrincipalForm(false)}
                  onSuccess={() => {
                    setShowPrincipalForm(false);
                    // Refresh principal list
                  }}
                />
              ) : (
                // Principal list will go here
                <div className="space-y-4">
                  {/* Principal list component */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
