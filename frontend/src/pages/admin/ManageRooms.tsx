import React, { useState, useEffect, useCallback } from 'react';
import { roomService } from '../../services/roomService';
import { Room, RoomCreate } from '../../types/room';

const ManageRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RoomCreate>({
    name: '',
    room_type: 'private',
    total_units: 1,
    base_price: '',
    description: '',
    amenities: [],
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const AMENITIES_OPTIONS = [
    'Wifi', 'Air Conditioning', 'Shower', 'Kitchen', 'TV', 'Parking', 'Pool'
  ];

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (err) {
      setError('Failed to fetch rooms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleDelete = async (roomId: number, roomName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng "${roomName}"?`)) {
      return;
    }
    
    try {
      await roomService.deleteRoom(roomId);
      // Refresh list
      await fetchRooms();
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert(err.response.data.detail || 'Không thể xóa phòng đã có dữ liệu đặt phòng!');
      } else {
        alert('Đã xảy ra lỗi khi xóa phòng. Vui lòng thử lại.');
      }
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const openAddModal = () => {
    setEditingRoomId(null);
    setFormData({
      name: '',
      room_type: 'private',
      total_units: 1,
      base_price: '',
      description: '',
      amenities: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoomId(room.id);
    setFormData({
      name: room.name,
      room_type: room.room_type as 'private' | 'dorm',
      total_units: room.total_units,
      base_price: room.base_price,
      description: room.description || '',
      amenities: room.amenities || [],
    });
    setIsModalOpen(true);
  };

  // Rule: If private, total_units = 1
  useEffect(() => {
    if (formData.room_type === 'private' && formData.total_units !== 1) {
      setFormData(prev => ({ ...prev, total_units: 1 }));
    }
  }, [formData.room_type, formData.total_units]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'total_units') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      if (editingRoomId) {
        await roomService.updateRoom(editingRoomId, formData);
      } else {
        await roomService.createRoom(formData);
      }
      setIsModalOpen(false);
      await fetchRooms();
    } catch (err: any) {
       alert(err.response?.data?.detail || 'Lưu thông tin thất bại.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const formatCurrency = (amountStr: string) => {
    const amount = parseFloat(amountStr);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Room Management</h1>
            <p className="mt-2 text-sm text-gray-500">
              Create, view, update, and categorize the homestay room inventory.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Room
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Room Table */}
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Units</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {room.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${room.room_type === 'private' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} capitalize`}>
                            {room.room_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.total_units} {room.room_type === 'dorm' ? 'Beds' : 'Rooms'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(room.base_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(room)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.id, room.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={() => setIsModalOpen(false)}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {editingRoomId ? 'Edit Room' : 'Add New Room'}
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Room Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name}
                          onChange={handleFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="room_type" className="block text-sm font-medium text-gray-700">Room Type</label>
                        <select
                          name="room_type"
                          id="room_type"
                          value={formData.room_type}
                          onChange={handleFormChange}
                          className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="private">Private (1 Room)</option>
                          <option value="dorm">Dorm (Multiple Beds)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="total_units" className="block text-sm font-medium text-gray-700">Total Units / Beds</label>
                        <input
                          type="number"
                          name="total_units"
                          id="total_units"
                          min="1"
                          required
                          value={formData.total_units}
                          onChange={handleFormChange}
                          disabled={formData.room_type === 'private'}
                          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${formData.room_type === 'private' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        />
                        {formData.room_type === 'private' && (
                          <p className="mt-1 text-xs text-gray-500">Private rooms are forcefully allocated 1 unit.</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          id="description"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Giới thiệu chi tiết về phòng..."
                        ></textarea>
                      </div>

                      <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Amenities</span>
                        <div className="grid grid-cols-2 gap-2">
                          {AMENITIES_OPTIONS.map(amenity => (
                            <label key={amenity} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.amenities?.includes(amenity)}
                                onChange={() => handleAmenityToggle(amenity)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                              />
                              <span className="ml-2 text-sm text-gray-600">{amenity}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">Base Price (USD)</label>
                        <input
                          type="number"
                          name="base_price"
                          id="base_price"
                          min="0"
                          step="0.01"
                          required
                          value={formData.base_price}
                          onChange={handleFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          disabled={formSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                        >
                          {formSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageRooms;
