import api from "./api";
import moment from 'moment';

export const taskService = {
  async getTasks() {
    try {
      const response = await api.get("/tasks");
      return response.data.map(task => ({
        ...task,
        dead_line: task.dead_line ? moment(task.dead_line) : null,
        remind_me: task.remind_me ? moment(task.remind_me) : null,
        _id: task._id.toString()
      }));
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al obtener tareas");
    }
  },

  async createTask(newTask) {
    try {
      const response = await api.post("/tasks", newTask);
      return {
        task: {
          ...response.data.task,
          dead_line: moment(response.data.task.dead_line),
          remind_me: response.data.task.remind_me ? moment(response.data.task.remind_me) : null,
          _id: response.data.task._id.toString()
        },
        // Agregar esto si el backend devuelve información sobre el recordatorio
        reminderSet: response.data.reminderSet
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al crear la tarea");
    }
  },

  async updateTaskStatus(taskId, newStatus) {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al actualizar el estado");
    }
  },

  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error al eliminar la tarea");
    }
  },

  async checkForActiveReminders() {
    try {
      const response = await api.get("/tasks/active-reminders");
      return response.data.map(reminder => ({
        ...reminder,
        reminderTime: moment(reminder.reminderTime).utcOffset(reminder.timezoneOffset),
        taskId: reminder.taskId.toString()
      }));
    } catch (error) {
      console.error('Error checking active reminders:', error);
      return [];
    }
  }
};