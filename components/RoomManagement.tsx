
import React, { useState } from 'react';
import { MeetingRoom } from '../types';
import { Search, Plus, MapPin, Users, Monitor, Edit2, Trash2, X, Save, CheckCircle, Ban } from 'lucide-react';

interface RoomManagementProps {
  rooms: MeetingRoom[];
  onAddRoom: (room: MeetingRoom) => Promise<void>;
  onUpdateRoom: (roomId: string, updates: Partial<MeetingRoom>) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({ rooms, onAddRoom, onUpdateRoom, onDeleteRoom }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

  const [formData, setFormData] = useState<Partial<MeetingRoom>>({
    name: '',
    location: '',
    capacity: 10,
    equipment: [],
    isAvailable: true
  });
  const [equipmentInput, setEquipmentInput] = useState('');

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (room?: MeetingRoom) => {
    if (room) {
      setEditingRoom(room);
      setFormData(room);
      setEquipmentInput(room.equipment.join(', '));
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        location: '',
        capacity: 10,
        equipment: [],
        isAvailable: true
      });
      setEquipmentInput('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const equipmentArray = equipmentInput.split(',').map(item => item.trim()).filter(item => item !== '');
    
    const finalData = { ...formData, equipment: equipmentArray };

    if (editingRoom) {
      await onUpdateRoom(editingRoom.id, finalData);
    } else {
      await onAddRoom({
        ...finalData as MeetingRoom,
        id: `r${Date.now()}`
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (room: MeetingRoom) => {
    if (confirm(`Are you sure you want to remove the room "${room.name}"? This action cannot be undone.`)) {
      await onDeleteRoom(room.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Meeting Rooms</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Manage physical spaces and equipment.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium"
        >
          <Plus size={16} className="mr-2" />
          Add Room
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search rooms by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 block w-full rounded-xl border-slate-200 dark:border-slate-700 border p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white dark:bg-slate-800 dark:placeholder-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map(room => (
          <div key={room.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{room.name}</h4>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin size={12} className="mr-1" /> {room.location}
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                room.isAvailable ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
              }`}>
                {room.isAvailable ? 'Available' : 'Maintenance'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mb-4 text-sm text-slate-600 dark:text-slate-300">
               <div className="flex items-center" title="Capacity">
                  <Users size={16} className="mr-1.5 text-slate-400 dark:text-slate-500" />
                  {room.capacity}
               </div>
               <div className="flex items-center" title="Equipment">
                  <Monitor size={16} className="mr-1.5 text-slate-400 dark:text-slate-500" />
                  {room.equipment.length} Assets
               </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {room.equipment.slice(0, 3).map((eq, i) => (
                <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                  {eq}
                </span>
              ))}
              {room.equipment.length > 3 && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">+{room.equipment.length - 3}</span>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700 opacity-60 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenModal(room)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(room)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {filteredRooms.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            No rooms found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                  placeholder="e.g. Executive Boardroom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                  placeholder="e.g. Floor 2, West Wing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipment</label>
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={e => setEquipmentInput(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                  placeholder="Comma separated (e.g. Projector, Whiteboard)"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate items with commas.</p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="isAvailable" className="text-sm text-slate-700 dark:text-slate-300">Room is Available for Booking</label>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  {editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
