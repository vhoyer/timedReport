import { ref, watch } from 'vue';
import { useSettings } from './settings';

export interface ProjectSettings {
  id: string;
  name: string;
  billableRate: number;  // Project-specific billable rate
  initialEstimate: number;  // Initial project estimate in the project's currency
}

const STORAGE_KEY = 'project-settings';

// Load projects from localStorage and sync with vm-data
const loadProjects = (): ProjectSettings[] => {
  try {
    // Load existing projects
    const saved = localStorage.getItem(STORAGE_KEY);
    const existingProjects: ProjectSettings[] = saved ? JSON.parse(saved) : [];
    
    try {
      // Load vm-data to find all projects
      const vmData = localStorage.getItem('vm-data');
      if (vmData) {
        const data = JSON.parse(vmData);
        const cards = data.cards || [];
        
        // Get all unique project names from vm-data
        const vmProjects = new Set(cards.map((card: any) => card.project).filter(Boolean));
        const existingProjectIds = new Set(existingProjects.map(p => p.id));
        
        // Add any missing projects from vm-data
        const newProjects: ProjectSettings[] = [];
        vmProjects.forEach((projectId: string) => {
          if (!existingProjectIds.has(projectId)) {
            newProjects.push({
              id: projectId,
              name: projectId,
              billableRate: 0, // Will be set to default when the project is first accessed
              initialEstimate: 0
            });
          }
        });
        
        // Save the new projects if any were added
        if (newProjects.length > 0) {
          const updatedProjects = [...existingProjects, ...newProjects];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
          return updatedProjects;
        }
      }
    } catch (vmDataError) {
      console.error('Failed to sync with vm-data:', vmDataError);
    }
    
    return existingProjects;
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};

// Create reactive projects
const projects = ref<ProjectSettings[]>(loadProjects());

// Save projects to localStorage whenever they change
watch(
  projects,
  (newProjects) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  },
  { deep: true }
);

export function useProjects() {
  const settingsStore = useSettings();
  
  const getProject = (projectId: string, defaultBillableRate: number): ProjectSettings => {
    const project = projects.value.find(p => p.id === projectId);
    if (project) return project;
    
    // Return a new project with default values if not found
    return {
      id: projectId,
      name: projectId,
      billableRate: defaultBillableRate,
      initialEstimate: 0
    };
  };

  const saveProject = (project: ProjectSettings) => {
    const index = projects.value.findIndex(p => p.id === project.id);
    if (index !== -1) {
      // Update existing project
      projects.value[index] = project;
    } else {
      // Add new project
      projects.value.push(project);
    }
  };
  
  // Update project billable rate
  const updateProjectBillableRate = (projectId: string, rate: number) => {
    const project = getProject(projectId, settingsStore.defaultBillableRate());
    saveProject({ ...project, billableRate: rate });
  };
  
  // Update project initial estimate
  const updateProjectEstimate = (projectId: string, estimate: number) => {
    const project = getProject(projectId, settingsStore.defaultBillableRate());
    saveProject({ ...project, initialEstimate: estimate });
  };

  const deleteProject = (projectId: string) => {
    projects.value = projects.value.filter(p => p.id !== projectId);
  };
  
  // Get all projects with their current rates and estimates
  const getAllProjects = () => {
    return projects.value.map(project => ({
      id: project.id,
      name: project.name,
      billableRate: project.billableRate,
      initialEstimate: project.initialEstimate
    }));
  };

  return {
    // State
    projects: getAllProjects(),
    
    // Actions
    getProject: (projectId: string) => getProject(projectId, settingsStore.defaultBillableRate()),
    saveProject: (project: Omit<ProjectSettings, 'billableRate' | 'initialEstimate'> & Partial<ProjectSettings>) => {
      const defaultRate = settingsStore.defaultBillableRate();
      const projectToSave: ProjectSettings = {
        id: project.id,
        name: project.name,
        billableRate: project.billableRate ?? defaultRate,
        initialEstimate: project.initialEstimate ?? 0
      };
      saveProject(projectToSave);
    },
    updateProjectBillableRate,
    updateProjectEstimate,
    deleteProject,
  };
}
