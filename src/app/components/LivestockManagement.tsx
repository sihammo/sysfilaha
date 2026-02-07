import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader, TrendingUp, Coins, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import api from '../utils/api';

interface Livestock {
  _id: string;
  type: string;
  quantity: number;
  age: string;
  health: string;
  purpose: string;
  productType: string;
  weight: string;
  unitPrice: number;
  monthlyFeedCost: number;
  notes: string;
  dateAdded: string;
}

interface LivestockManagementProps {
  farmerId: string;
}

const LIVESTOCK_TYPES = ['أبقار', 'أغنام', 'ماعز', 'دجاج', 'إوز', 'خيول', 'حمير', 'جمال'];
const HEALTH_STATUS = ['سليم', 'بحاجة للمراقبة', 'مريض', 'تحت العلاج'];
const PURPOSE_OPTIONS = ['تربية', 'إنتاج', 'بيع', 'استهلاك شخصي', 'سحب'];

const PRODUCT_TYPES: Record<string, string[]> = {
  'أبقار': ['حليب', 'لحم', 'جلد'],
  'أغنام': ['لحم', 'صوف', 'حليب'],
  'ماعز': ['حليب', 'لحم', 'جلد'],
  'دجاج': ['بيض', 'لحم'],
  'إوز': ['بيض', 'لحم'],
  'خيول': ['لحم', 'تربية'],
  'حمير': ['نقل', 'تربية'],
  'جمال': ['حليب', 'لحم'],
};

export default function LivestockManagement({ farmerId }: LivestockManagementProps) {
  const [livestocks, setLivestocks] = useState<Livestock[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    type: '',
    quantity: '',
    age: '',
    health: '',
    purpose: '',
    productType: '',
    weight: '',
    unitPrice: '',
    monthlyFeedCost: '',
    notes: '',
  });

  useEffect(() => {
    loadLivestock();
  }, [farmerId]);

  const loadLivestock = async () => {
    try {
      setIsLoading(true);
      const data = await api.farmer.getLivestock();
      setLivestocks(data);
    } catch (e) {
      toast.error("فشل تحميل المواشي");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      type: value,
      productType: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        monthlyFeedCost: parseFloat(formData.monthlyFeedCost) || 0,
      };

      if (editingId) {
        await api.farmer.updateLivestock(editingId, payload);
        toast.success("تم تحديث البيانات بنجاح");
      } else {
        await api.farmer.addLivestock(payload);
        toast.success('تم إضافة المواشي بنجاح');
      }
      loadLivestock();
      handleCancel();
    } catch (error: any) {
      toast.error(error.message || "فشل العملية");
    }
  };

  const handleEdit = (livestock: Livestock) => {
    setFormData({
      type: livestock.type,
      quantity: livestock.quantity.toString(),
      age: livestock.age,
      health: livestock.health,
      purpose: livestock.purpose,
      productType: livestock.productType,
      weight: livestock.weight,
      unitPrice: livestock.unitPrice.toString(),
      monthlyFeedCost: livestock.monthlyFeedCost.toString(),
      notes: livestock.notes,
    });
    setEditingId(livestock._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه السجلات؟")) {
      try {
        await api.farmer.deleteLivestock(id);
        toast.success("تم الحذف بنجاح");
        loadLivestock();
      } catch (error: any) {
        toast.error("فشل الحذف");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      type: '',
      quantity: '',
      age: '',
      health: '',
      purpose: '',
      productType: '',
      weight: '',
      unitPrice: '',
      monthlyFeedCost: '',
      notes: '',
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const totalLivestock = livestocks.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalMonthlyFeedCost = livestocks.reduce((sum, item) => sum + (item.monthlyFeedCost || 0), 0);
  const totalValue = livestocks.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);

  if (isLoading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl text-green-800">إدارة المواشي</h2>
        <Button onClick={() => setIsFormOpen(true)} className="bg-green-600">
          <Plus className="w-4 h-4 ml-2" /> إضافة جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-600"><CardContent className="pt-6"><p className="text-sm text-gray-600">الأنواع</p><div className="text-3xl font-bold text-green-600">{livestocks.length}</div></CardContent></Card>
        <Card className="border-l-4 border-l-amber-600"><CardContent className="pt-6"><p className="text-sm text-gray-600">إجمالي الرؤوس</p><div className="text-3xl font-bold text-amber-600">{totalLivestock}</div></CardContent></Card>
        <Card className="border-l-4 border-l-cyan-600"><CardContent className="pt-6"><p className="text-sm text-gray-600">القيمة الإجمالية</p><div className="text-2xl font-bold text-cyan-600">{totalValue.toLocaleString()} دج</div></CardContent></Card>
        <Card className="border-l-4 border-l-red-600"><CardContent className="pt-6"><p className="text-sm text-gray-600">تكلفة التغذية</p><div className="text-2xl font-bold text-red-600">{totalMonthlyFeedCost.toLocaleString()} دج</div></CardContent></Card>
      </div>

      {isFormOpen && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader><CardTitle>{editingId ? 'تعديل البيانات' : 'إضافة مواشي'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>النوع</Label>
                  <select name="type" value={formData.type} onChange={handleTypeChange} required className="w-full p-2 border rounded">
                    <option value="">اختر</option>
                    {LIVESTOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label>الكمية</Label><Input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} required /></div>
                <div><Label>الغرض</Label><select name="purpose" value={formData.purpose} onChange={handleInputChange} required className="w-full p-2 border rounded">
                  <option value="">اختر</option>
                  {PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select></div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-green-600">حفظ</Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">إلغاء</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {livestocks.map((ls) => (
          <Card key={ls._id} className="hover:shadow-md">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{ls.type} ({ls.quantity} رأس)</p>
                <p className="text-sm text-gray-500">{ls.purpose} - {ls.health}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(ls)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(ls._id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
