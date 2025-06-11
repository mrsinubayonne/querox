
import React from 'react';
import { Label } from '@/components/ui/label';

interface Template {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div>
      <Label>Choisir un template</Label>
      <div className="grid gap-3 mt-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{template.name}</h3>
              <div className="flex gap-1">
                {Object.values(template.colors).slice(0, 3).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
