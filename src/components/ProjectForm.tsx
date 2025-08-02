import React from "react";

interface Props {
  formData: any;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
}

const ProjectForm: React.FC<Props> = ({
  formData,
  onChange,
  onSubmit,
  isEdit,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-gray-50 p-4 rounded shadow mb-6"
    >
      <input
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="Project Name"
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="client"
        value={formData.client}
        onChange={onChange}
        placeholder="Client Name"
        className="w-full p-2 border rounded"
      />
      <input
        name="description"
        value={formData.description}
        onChange={onChange}
        placeholder="Description"
        className="w-full p-2 border rounded"
      />
      <input
        name="totalHours"
        type="number"
        value={formData.totalHours}
        onChange={onChange}
        placeholder="Total Hours"
        className="w-full p-2 border rounded"
      />
      <select
        name="isActive"
        value={formData.isActive.toString()}
        onChange={onChange}
        className="w-full p-2 border rounded"
      >
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isEdit ? "Update Project" : "Create Project"}
      </button>
    </form>
  );
};

export default ProjectForm;
