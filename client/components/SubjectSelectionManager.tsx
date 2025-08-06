import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen, Save, RefreshCw } from 'lucide-react';
import { useSubjectFilter } from '@/contexts/SubjectFilterContext';

// Types
interface Subject {
  id: number;
  name: string;
  code: string;
}

interface SubjectSelectionManagerProps {
  availableSubjects?: Subject[];
  readonly?: boolean;
  onSubjectsChange?: (subjects: Subject[]) => void;
  className?: string;
}

const SubjectSelectionManager: React.FC<SubjectSelectionManagerProps> = ({
  availableSubjects: propAvailableSubjects,
  readonly = false,
  onSubjectsChange,
  className = ''
}) => {
  const { selectedSubjects, isLoading, error, updateSubjects, clearError } = useSubjectFilter();
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>(propAvailableSubjects || []);
  const [localSelectedSubjects, setLocalSelectedSubjects] = useState<Subject[]>(selectedSubjects);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch available subjects if not provided
  useEffect(() => {
    if (!propAvailableSubjects) {
      fetchAvailableSubjects();
    }
  }, [propAvailableSubjects]);

  // Update local state when context changes
  useEffect(() => {
    setLocalSelectedSubjects(selectedSubjects);
    setHasChanges(false);
  }, [selectedSubjects]);

  // Check for changes
  useEffect(() => {
    const currentIds = selectedSubjects.map(s => s.id).sort();
    const localIds = localSelectedSubjects.map(s => s.id).sort();
    setHasChanges(JSON.stringify(currentIds) !== JSON.stringify(localIds));
  }, [selectedSubjects, localSelectedSubjects]);

  const fetchAvailableSubjects = async () => {
    setFetchingSubjects(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/api/subjects/', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setAvailableSubjects(data.subjects || []);
      } else {
        console.error('Failed to fetch subjects:', data.message);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setFetchingSubjects(false);
    }
  };

  const handleSubjectToggle = (subject: Subject, checked: boolean) => {
    if (readonly) return;

    let updatedSubjects: Subject[];
    if (checked) {
      updatedSubjects = [...localSelectedSubjects, subject];
    } else {
      updatedSubjects = localSelectedSubjects.filter(s => s.id !== subject.id);
    }
    
    setLocalSelectedSubjects(updatedSubjects);
    
    // Call external onChange if provided
    if (onSubjectsChange) {
      onSubjectsChange(updatedSubjects);
    }
  };

  const handleSave = async () => {
    if (readonly || !hasChanges) return;

    setIsSaving(true);
    clearError();

    const success = await updateSubjects(localSelectedSubjects);
    
    if (success) {
      setHasChanges(false);
    }
    
    setIsSaving(false);
  };

  const handleReset = () => {
    if (readonly) return;
    setLocalSelectedSubjects(selectedSubjects);
    setHasChanges(false);
  };

  const isSubjectSelected = (subjectId: number): boolean => {
    return localSelectedSubjects.some(s => s.id === subjectId);
  };

  if (fetchingSubjects) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading available subjects...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span>Subject Selection</span>
          {!readonly && hasChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Unsaved changes)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {availableSubjects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No subjects available</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAvailableSubjects}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {availableSubjects.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`subject-${subject.id}`}
                    checked={isSubjectSelected(subject.id)}
                    onCheckedChange={(checked) => 
                      handleSubjectToggle(subject, checked as boolean)
                    }
                    disabled={readonly || isLoading || isSaving}
                  />
                  <Label
                    htmlFor={`subject-${subject.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{subject.name}</div>
                      <div className="text-sm text-gray-500">{subject.code}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>
                  Selected: {localSelectedSubjects.length} of {availableSubjects.length} subjects
                </span>
                {hasChanges && !readonly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isLoading || isSaving}
                  >
                    Reset
                  </Button>
                )}
              </div>

              {!readonly && (
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isLoading || isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectSelectionManager;