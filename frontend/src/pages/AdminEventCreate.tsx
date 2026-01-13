
import { useState, useEffect, type FormEvent } from 'react';
import { toast } from '../lib/toast';
import { useNavigate, useParams } from 'react-router-dom';
import SearchableSelect from '../components/admin/SearchableSelect';
import client from '../api/client';

export default function AdminEventCreate() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Check for edit mode
    const isEditMode = !!id;

    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        poster: '',
        clubs: [],
        isCollaboration: false,
        venue: '',
        startDate: '',
        startTime: '',
        endDate: undefined,
        endTime: '',
        fee: 0,
        feePerPerson: undefined,
        feeStructure: undefined,
        groupSizeMin: 1,
        groupSizeMax: 1,
        studentCoordinators: [],
        facultyCoordinators: [],
        registrationsOpen: true,
        isHidden: false,
    });
    const [clubs, setClubs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingClubs, setLoadingClubs] = useState(true);
    const [feeType, setFeeType] = useState<'flat' | 'perPerson' | 'structure'>('flat');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clubsRes, usersRes] = await Promise.all([
                    client.get('/clubs/'),
                    client.get('/users/')
                ]);
                setClubs(clubsRes.data);
                setUsers(usersRes.data);

                if (isEditMode) {
                    const eventRes = await client.get(`/events/${id}`);
                    const event = eventRes.data;

                    // Format dates for input:datetime-local or date/time inputs
                    // Backend returns ISO string. We split to date and time inputs.
                    const start = event.startDate ? new Date(event.startDate) : null;
                    const end = event.endDate ? new Date(event.endDate) : null;

                    setFormData({
                        ...event,
                        startDate: start ? start.toISOString().split('T')[0] : '',
                        startTime: start ? start.toTimeString().slice(0, 5) : '',
                        endDate: end ? end.toISOString().split('T')[0] : '',
                        endTime: end ? end.toTimeString().slice(0, 5) : '',
                        clubs: event.clubs.map((c: any) => c._id || c), // Handle populated vs ID
                    });

                    if (event.feeStructure) setFeeType('structure');
                    else if (event.feePerPerson) setFeeType('perPerson');
                    else setFeeType('flat');
                }

            } catch (error: any) {
                toast.error('Failed to load data.');
            } finally {
                setLoadingClubs(false);
            }
        };
        fetchData();
    }, [id, isEditMode]);

    // ... items ...

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCoordinatorChange = (index: number, type: 'student' | 'faculty', field: 'name' | 'phone', value: string) => {
        const fieldName = type === 'student' ? 'studentCoordinators' : 'facultyCoordinators';
        const coordinators = [...(formData[fieldName] || [])];
        coordinators[index] = { ...coordinators[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, [fieldName]: coordinators }));
    };

    const addCoordinator = (type: 'student' | 'faculty') => {
        const fieldName = type === 'student' ? 'studentCoordinators' : 'facultyCoordinators';
        const coordinators = [...(formData[fieldName] || []), { _id: '', name: '', phone: '' }];
        setFormData((prev: any) => ({ ...prev, [fieldName]: coordinators }));
    };

    const removeCoordinator = (index: number, type: 'student' | 'faculty') => {
        const fieldName = type === 'student' ? 'studentCoordinators' : 'facultyCoordinators';
        const coordinators = [...(formData[fieldName] || [])];
        coordinators.splice(index, 1);
        setFormData((prev: any) => ({ ...prev, [fieldName]: coordinators }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            // Fix dates to ISO format
            const payload = { ...formData };
            if (payload.startDate && payload.startTime) payload.startDate = new Date(`${payload.startDate}T${payload.startTime}`).toISOString();
            if (payload.endDate && payload.endTime) payload.endDate = new Date(`${payload.endDate}T${payload.endTime}`).toISOString();

            if (isEditMode) {
                await client.put(`/events/${id}`, payload);
                toast.success('Event updated successfully!');
            } else {
                await client.post('/events/', payload);
                toast.success('Event created successfully!');
            }
            navigate('/admin');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || 'Failed to create event');
        }
    };

    if (loadingClubs) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto glass-card p-8">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{isEditMode ? 'Edit Event' : 'Add New Event'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="flex md:flex-row flex-col gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-text-secondary">Event Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="glass-input mt-1" />
                    </div>
                    <div className="flex items-end gap-4 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="registrationsOpen"
                                checked={formData.registrationsOpen}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-600 bg-black/40 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-text-secondary">Registrations Open</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isHidden"
                                checked={formData.isHidden}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-600 bg-black/40 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-text-secondary">Hidden (Draft)</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="glass-input mt-1"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Poster URL</label>
                        <input type="text" name="poster" value={formData.poster} onChange={handleChange} className="glass-input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Venue</label>
                        <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="glass-input mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Start Date</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="glass-input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Start Time</label>
                        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="glass-input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">End Date</label>
                        <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} className="glass-input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">End Time</label>
                        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="glass-input mt-1" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary">Fee Type</label>
                    <select value={feeType} onChange={(e: any) => setFeeType(e.target.value)} className="glass-input mt-1">
                        <option value="flat">Flat Fee</option>
                        <option value="perPerson">Per Person</option>
                        <option value="structure">Fee Structure (by team size)</option>
                    </select>
                </div>

                {feeType === 'flat' && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Fee (₹)</label>
                        <input type="number" name="fee" value={formData.fee} onChange={handleChange} min="0" className="glass-input mt-1" />
                    </div>
                )}

                {feeType === 'perPerson' && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Fee Per Person (₹)</label>
                        <input type="number" name="feePerPerson" value={formData.feePerPerson || 0} onChange={handleChange} min="0" className="glass-input mt-1" />
                    </div>
                )}

                {feeType === 'structure' && (
                    <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded text-sm text-yellow-500">Fee Structure Builder requires group sizes first.</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Min Group Size</label>
                        <input type="number" name="groupSizeMin" value={formData.groupSizeMin} onChange={handleChange} required min="1" className="glass-input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Max Group Size</label>
                        <input type="number" name="groupSizeMax" value={formData.groupSizeMax} onChange={handleChange} required min="1" className="glass-input mt-1" />
                    </div>
                </div>

                {feeType === 'structure' && formData.groupSizeMin && formData.groupSizeMax && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Fee Structure (₹)</label>
                        <div className="space-y-2 mt-2">
                            {Array.from({ length: parseInt(formData.groupSizeMax) - parseInt(formData.groupSizeMin) + 1 }, (_, i) => parseInt(formData.groupSizeMin) + i).map(size => (
                                <div key={size} className="flex items-center gap-2">
                                    <label className="w-32 text-sm text-text-primary">Team of {size}:</label>
                                    <input
                                        type="number"
                                        value={formData.feeStructure?.[size] || 0}
                                        onChange={(e) => {
                                            const newStructure = { ...(formData.feeStructure || {}), [size]: parseFloat(e.target.value) || 0 };
                                            setFormData((prev: any) => ({ ...prev, feeStructure: newStructure }));
                                        }}
                                        min="0"
                                        className="glass-input flex-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Organizing Club(s)</label>
                    <SearchableSelect
                        options={clubs}
                        value={formData.clubs}
                        onChange={(selectedValues) => setFormData((prev: any) => ({ ...prev, clubs: selectedValues }))}
                        placeholder="Select clubs..."
                        isMulti={true}
                    />
                </div>

                {[
                    { type: 'student', label: 'Student Coordinators' },
                    { type: 'faculty', label: 'Faculty Coordinators' }
                ].map((cType) => (
                    <div key={cType.type} className="border-t border-white/10 pt-4">
                        <label className="block text-lg font-semibold mb-2 text-text-primary">{cType.label}</label>
                        {(formData[cType.type === 'student' ? 'studentCoordinators' : 'facultyCoordinators'] || []).map((coord: any, idx: number) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <select
                                    className="glass-input flex-1"
                                    value={coord._id || ''}
                                    onChange={(e) => {
                                        const u = users.find(user => user._id === e.target.value);
                                        if (u) handleCoordinatorChange(idx, cType.type as any, 'name', u.name);
                                        const fieldName = cType.type === 'student' ? 'studentCoordinators' : 'facultyCoordinators';
                                        const list = [...formData[fieldName]];
                                        list[idx]._id = e.target.value;
                                        list[idx].name = u?.name;
                                        list[idx].phone = u?.phoneNumber || list[idx].phone;
                                        setFormData((prev: any) => ({ ...prev, [fieldName]: list }));
                                    }}
                                >
                                    <option value="">Select User</option>
                                    {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                                </select>
                                <input
                                    placeholder="Phone"
                                    className="glass-input w-32"
                                    value={coord.phone || ''}
                                    onChange={e => handleCoordinatorChange(idx, cType.type as any, 'phone', e.target.value)}
                                />
                                <button type="button" onClick={() => removeCoordinator(idx, cType.type as any)} className="text-red-500 hover:text-red-400">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addCoordinator(cType.type as any)} className="text-primary hover:text-primary-hover">+ Add Coordinator</button>
                    </div>
                ))}

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin')} className="px-4 py-2 text-text-secondary hover:text-white">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover shadow-lg shadow-primary-glow/50">{isEditMode ? 'Update Event' : 'Create Event'}</button>
                </div>
            </form>
        </div>
    );
}
