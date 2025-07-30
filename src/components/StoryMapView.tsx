import React, { useState } from 'react';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import type { StoryMap, UserStory } from '../types/story';
import { StoryDetailModal } from './StoryDetailModal';

interface StoryMapViewProps {
  storyMap: StoryMap;
  onBack: () => void;
}

export const StoryMapView: React.FC<StoryMapViewProps> = ({ storyMap, onBack }) => {
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleStoryClick = (story: UserStory) => {
    setSelectedStory(story);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStory(null);
  };

  const downloadYAML = () => {
    const yamlContent = convertToYAML(storyMap);
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyMap.title.toLowerCase().replace(/\s+/g, '-')}-story-map.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToYAML = (storyMap: StoryMap): string => {
    const yamlData = {
      title: storyMap.title,
      description: storyMap.description,
      epics: storyMap.epics.map(epic => ({
        title: epic.title,
        description: epic.description,
        features: epic.features.map(feature => ({
          title: feature.title,
          description: feature.description,
          tasks: feature.tasks.map(task => ({
            title: task.title,
            description: task.description,
            priority: task.priority,
            effort: task.estimatedEffort,
            acceptance_criteria: task.acceptanceCriteria
          }))
        }))
      }))
    };

    return `# ${yamlData.title}
# ${yamlData.description}

${yamlData.epics.map(epic => `## ${epic.title}
${epic.description}

${epic.features.map(feature => `### ${feature.title}
${feature.description}

${feature.tasks.map(task => `#### ${task.title}
- **Description:** ${task.description}
- **Priority:** ${task.priority}
- **Effort:** ${task.effort}
- **Acceptance Criteria:**
${task.acceptance_criteria.map(criteria => `  - ${criteria}`).join('\n')}

`).join('')}`).join('')}`).join('\n')}`;
  };

  return (
    <div className="story-map-container min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{storyMap.title}</h1>
                <p className="text-gray-600">{storyMap.description}</p>
              </div>
            </div>
            <button
              onClick={downloadYAML}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download YAML
            </button>
          </div>
        </div>
      </div>

      {/* Story Map Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {storyMap.epics.map((epic) => (
            <div key={epic.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Epic Header */}
              <div className="bg-indigo-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">{epic.title}</h2>
                <p className="text-indigo-100 mt-1">{epic.description}</p>
              </div>

              {/* Features */}
              <div className="p-6">
                <div className="grid gap-6">
                  {epic.features.map((feature) => (
                    <div key={feature.id} className="border border-gray-200 rounded-lg">
                      {/* Feature Header */}
                      <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                      </div>

                      {/* Tasks */}
                      <div className="p-4">
                        <div className="grid gap-4">
                          {feature.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="story-card cursor-pointer"
                              onClick={() => handleStoryClick(task)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                                  <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                                  
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {task.priority} priority
                                    </span>
                                    <span className="text-gray-500">{task.estimatedEffort}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {task.status}
                                    </span>
                                  </div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Detail Modal */}
      {showModal && selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={closeModal}
        />
      )}
    </div>
  );
}; 