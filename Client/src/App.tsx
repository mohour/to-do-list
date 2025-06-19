import React, { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  descp: string;
  completed: boolean;
}

export default function TodoApp() {
  const [showForm, setShowForm] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [descp, setDescp] = useState("");
  const [completed, setCompleted] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // États pour la modal de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const fetchTodos = async () => {
    try {
      const res = await fetch("http://localhost:5000/todos");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Erreur de récupération des tâches", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Fonction pour afficher la modal de confirmation
  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  // Fonction pour confirmer l'action
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage("");
  };

  // Fonction pour annuler l'action
  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage("");
  };

  const handleAddOrUpdateTask = async () => {
    try {
      if (editingTodo) {
        await fetch(`http://localhost:5000/todos/${editingTodo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, descp, completed })
        });
      } else {
        await fetch("http://localhost:5000/todos", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, descp, completed })
        });
      }
      setTitle("");
      setDescp("");
      setCompleted(false);
      setShowForm(false);
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la mise à jour de la tâche", error);
    }
  };

  const handleEdit = (todo: Todo) => {
    setTitle(todo.title);
    setDescp(todo.descp);
    setCompleted(todo.completed);
    setEditingTodo(todo);
    setShowForm(true);
  };

  // Fonction de suppression d'une tâche (sans confirmation directe)
  const deleteTodo = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, { method: 'DELETE' });
      fetchTodos();
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche", error);
    }
  };

  // Fonction de suppression de toutes les tâches (sans confirmation directe)
  const deleteAllTodos = async () => {
    try {
      await fetch("http://localhost:5000/todos", { method: 'DELETE' });
      fetchTodos();
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes les tâches", error);
    }
  };

  // Fonction appelée par le bouton supprimer une tâche (avec confirmation)
  const handleDelete = (id: number, title: string) => {
    showConfirmation(
      `Êtes-vous sûr de vouloir supprimer la tâche "${title}" ?`,
      () => deleteTodo(id)
    );
  };

  // Fonction appelée par le bouton supprimer tout (avec confirmation)
  const handleClearAll = () => {
    if (todos.length === 0) {
      alert("Aucune tâche à supprimer !");
      return;
    }
    showConfirmation(
      `Êtes-vous sûr de vouloir supprimer TOUTES les tâches (${todos.length} tâches) ?`,
      deleteAllTodos
    );
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === "completed") return todo.completed;
      if (filter === "incomplete") return !todo.completed;
      return true;
    })
    .sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      if (sortOrder === "asc") return titleA.localeCompare(titleB);
      else return titleB.localeCompare(titleA);
    });

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-indigo-400">TO DO LIST</h1>
          <p className="text-lg text-white mt-2">Gérez vos tâches efficacement</p>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingTodo(null);
              setTitle("");
              setDescp("");
              setCompleted(false);
              setShowForm(true);
            }}
          >
            <span className="text-xl">+</span> Ajouter
          </button>
          <button
            className="btn btn-error"
            onClick={handleClearAll}
          >
            🗑️ Supprimer tout
          </button>
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <button
            className={`btn ${filter === "all" ? "btn-active btn-neutral" : "btn-ghost"}`}
            onClick={() => setFilter("all")}
          >
            Toutes
          </button>
          <button
            className={`btn ${filter === "completed" ? "btn-active btn-success" : "btn-ghost"}`}
            onClick={() => setFilter("completed")}
          >
            Terminées
          </button>
          <button
            className={`btn ${filter === "incomplete" ? "btn-active btn-warning" : "btn-ghost"}`}
            onClick={() => setFilter("incomplete")}
          >
            En cours
          </button>
        </div>

        <div className="flex justify-center mt-4">
          <label className="text-sm mr-2">Trier par titre :</label>
          <select
            className="select select-bordered select-sm bg-gray-700 text-white"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>

        {showForm && (
          <div className="max-w-2xl mx-auto mt-6 bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingTodo ? "Modifier la tâche" : "Nouvelle tâche"}
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddOrUpdateTask();
              }}
            >
              <div>
                <label className="block text-sm mb-1">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered w-full bg-gray-700 text-white"
                  placeholder="Entrez le titre de la tâche"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  value={descp}
                  onChange={(e) => setDescp(e.target.value)}
                  className="textarea textarea-bordered w-full bg-gray-700 text-white"
                  placeholder="Entrez une description"
                  required
                ></textarea>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text text-white">Tâche complétée</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary">
                  {editingTodo ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-10 max-w-5xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Liste des tâches ({filteredTodos.length})
            </h2>
          </div>
          {filteredTodos.length === 0 ? (
            <div className="text-center text-white">
              <p className="text-lg">Aucune tâche trouvée</p>
              <p className="text-sm">Cliquez sur "Ajouter" pour créer votre première tâche</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg break-words">{todo.title}</h3>
                    <p className="text-sm text-gray-300 break-words">{todo.descp}</p>
                  </div>
                  <div className="flex gap-2 items-center self-end md:self-auto">
                    <span
                      className={`badge ${todo.completed ? "badge-success" : "badge-warning"}`}
                    >
                      {todo.completed ? "Complétée" : "En cours"}
                    </span>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleEdit(todo)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(todo.id, todo.title)}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-5xl mx-auto">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm">Total des tâches</p>
            <p className="text-3xl text-indigo-400 font-bold">{todos.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm">Tâches terminées</p>
            <p className="text-3xl text-green-400 font-bold">
              {todos.filter((t) => t.completed).length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm">Tâches en cours</p>
            <p className="text-3xl text-yellow-400 font-bold">
              {todos.filter((t) => !t.completed).length}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMATION */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-4">
                Confirmation de suppression
              </h3>
              
              <p className="text-sm text-gray-300 mb-6">
                {confirmMessage}
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  className="btn btn-error"
                  onClick={handleConfirm}
                >
                  Confirmer
                </button>
                <button
                  className="btn btn-outline"
                  onClick={handleCancel}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}