import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

const CATEGORIES = [
  { value: 'mains', label: 'Mains' },
  { value: 'sides', label: 'Sides' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'specials', label: 'Specials' },
];

export default function VendorMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'mains', image_url: '', is_available: true, is_special: false, has_spice_option: false });

  const { data: truck } = useQuery({
    queryKey: ['my-truck'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const trucks = await base44.entities.FoodTruck.filter({ owner_email: user.email });
      return trucks[0];
    },
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['vendor-menu', truck?.id],
    queryFn: () => base44.entities.MenuItem.filter({ truck_id: truck.id }),
    enabled: !!truck?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, price: parseFloat(data.price), truck_id: truck.id };
      if (editItem) {
        await base44.entities.MenuItem.update(editItem.id, payload);
      } else {
        await base44.entities.MenuItem.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu'] });
      setShowForm(false);
      setEditItem(null);
      setForm({ name: '', description: '', price: '', category: 'mains', image_url: '', is_available: true, is_special: false, has_spice_option: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-menu'] }),
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: String(item.price), category: item.category || 'mains', image_url: item.image_url || '', is_available: item.is_available !== false, is_special: item.is_special || false, has_spice_option: item.has_spice_option || false });
    setShowForm(true);
  };

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/vendor')} className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-lg">Menu</h1>
        </div>
        <button
          onClick={() => { setEditItem(null); setForm({ name: '', description: '', price: '', category: 'mains', image_url: '', is_available: true, is_special: false, has_spice_option: false }); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="text-muted-foreground text-sm">No items yet. Add your first menu item!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map(item => (
            <div key={item.id} className="flex gap-3 bg-card rounded-2xl p-3">
              {item.image_url && <img src={item.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-primary font-bold">${item.price?.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(item.id)} className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">{item.category}</span>
                  {!item.is_available && <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">Sold out</span>}
                  {item.is_special && <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">Special</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editItem ? 'Edit Item' : 'New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary border-0" />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary border-0" />
            <Input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="bg-secondary border-0" />
            <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="bg-secondary border-0" />
            <button
              type="button"
              onClick={() => setShowCategoryDrawer(true)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm"
              style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
            >
              <span>{CATEGORIES.find(c => c.value === form.category)?.label || 'Category'}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <div className="flex items-center justify-between">
              <span className="text-sm">Available</span>
              <Switch checked={form.is_available} onCheckedChange={v => setForm({ ...form, is_available: v })} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Special Item</span>
              <Switch checked={form.is_special} onCheckedChange={v => setForm({ ...form, is_special: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm">Spice Level Selector</span>
                <p className="text-[10px] text-muted-foreground">Show spice options on item page</p>
              </div>
              <Switch checked={form.has_spice_option} onCheckedChange={v => setForm({ ...form, has_spice_option: v })} />
            </div>
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.name || !form.price}
              className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm disabled:opacity-50"
            >
              {editItem ? 'Update' : 'Add'} Item
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Native-feel Category Bottom Sheet */}
      <Drawer open={showCategoryDrawer} onOpenChange={setShowCategoryDrawer}>
        <DrawerContent style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
          <DrawerHeader>
            <DrawerTitle style={{ color: '#dff0e8' }}>Select Category</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-4 pb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setForm(f => ({ ...f, category: cat.value })); setShowCategoryDrawer(false); }}
                className="flex items-center justify-between px-4 py-4 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: form.category === cat.value ? 'rgba(119,255,200,0.1)' : 'transparent',
                  color: form.category === cat.value ? '#77ffc8' : '#dff0e8',
                  border: form.category === cat.value ? '1px solid rgba(119,255,200,0.3)' : '1px solid transparent',
                  minHeight: '52px',
                }}
              >
                {cat.label}
                {form.category === cat.value && (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-6" stroke="#77ffc8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}