import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripApi } from '../api/tripApi';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxMember: 2,
    coverImage: ''
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Tiêu đề không được để trống');
    if (!formData.location.trim()) return toast.error('Địa điểm không được để trống');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime())) {
      return toast.error('Ngày bắt đầu không hợp lệ');
    }
    if (isNaN(end.getTime())) {
      return toast.error('Ngày kết thúc không hợp lệ');
    }
    if (start < today) {
      return toast.error('Ngày bắt đầu không được ở quá khứ');
    }
    if (end <= start) {
      return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    }
    if (formData.maxMember < 2) return toast.error('Số lượng thành viên tối thiểu là 2');

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxMembers: Number(formData.maxMember),
        coverImage: formData.coverImage,
        tags
      };
      const res = await tripApi.createTrip(payload);
      toast.success('Tạo chuyến đi thành công!');
      navigate(`/trips/${res.data.id || res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi tạo chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 page-enter">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tạo chuyến đi mới</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề chuyến đi <span className="text-red-500">*</span></label>
          <input required name="title" value={formData.title} onChange={handleChange} type="text" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="VD: Hà Nội - Sapa 3 ngày 2 đêm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm <span className="text-red-500">*</span></label>
          <input required name="location" value={formData.location} onChange={handleChange} type="text" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Sapa, Lào Cai" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
            <input required name="startDate" value={formData.startDate} onChange={handleChange} type="date" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
            <input required name="endDate" value={formData.endDate} onChange={handleChange} type="date" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số thành viên (Tối đa) <span className="text-red-500">*</span></label>
            <input required name="maxMember" value={formData.maxMember} onChange={handleChange} min="2" type="number" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa (URL)</label>
            <input name="coverImage" value={formData.coverImage} onChange={handleChange} type="url" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32" placeholder="Lịch trình, chi phí dự kiến..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Nhấn Thêm hoặc Enter)</label>
          <div className="flex gap-2 mb-2">
            <input 
              value={tagInput} 
              onChange={e => setTagInput(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} 
              type="text" 
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
              placeholder="VD: chill, trekking" 
            />
            <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition">Thêm</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                #{tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-400 hover:text-blue-800">&times;</button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 mt-4">
          {loading ? 'Đang tạo...' : 'Tạo chuyến đi'}
        </button>
      </form>
    </div>
  );
}
