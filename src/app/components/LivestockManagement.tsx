import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader, TrendingUp, Coins, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface Livestock {
  id: string;
  type: string;
  quantity: number;
  age: string;
  health: string;
  purpose: string; // التربية، الإنتاج، البيع، الاستهلاك الشخصي
  productType: string; // حليب، لحم، بيض، إلخ
  weight: string; // الوزن التقريبي
  unitPrice: number; // سعر الوحدة
  monthlyFeedCost: number; // تكلفة الغذاء الشهرية
  notes: string;
  dateAdded: string;
}

interface LivestockManagementProps {
  farmerId: string;
}

const LIVESTOCK_TYPES = [
  'أبقار',
  'أغنام',
  'ماعز',
  'دجاج',
  'إوز',
  'خيول',
  'حمير',
  'جمال',
];

const HEALTH_STATUS = [
  'سليم',
  'بحاجة للمراقبة',
  'مريض',
  'تحت العلاج',
];

const PURPOSE_OPTIONS = [
  'تربية',
  'إنتاج',
  'بيع',
  'استهلاك شخصي',
  'سحب',
];

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
    // Load livestocks from localStorage
    const key = `livestocks-${farmerId}`;
    const stored = localStorage.getItem(key);
    setLivestocks(stored ? JSON.parse(stored) : []);
    setIsLoading(false);
  }, [farmerId]);

  const saveLivestocks = (items: Livestock[]) => {
    const key = `livestocks-${farmerId}`;
    localStorage.setItem(key, JSON.stringify(items));
    setLivestocks(items);
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
      productType: '', // Reset product type when changing animal type
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.quantity || !formData.age || !formData.health || !formData.purpose) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (editingId) {
      const updated = livestocks.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...formData,
              quantity: parseInt(formData.quantity),
              unitPrice: parseFloat(formData.unitPrice) || 0,
              monthlyFeedCost: parseFloat(formData.monthlyFeedCost) || 0,
            }
          : item
      );
      saveLivestocks(updated);
      toast.success('تم تحديث المواشي بنجاح');
      setEditingId(null);
    } else {
      const newLivestock: Livestock = {
        id: `livestock-${Date.now()}`,
        ...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice) || 0,
        monthlyFeedCost: parseFloat(formData.monthlyFeedCost) || 0,
        dateAdded: new Date().toISOString(),
      };
      saveLivestocks([...livestocks, newLivestock]);
      toast.success('تم إضافة المواشي بنجاح');
    }

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
    setIsFormOpen(false);
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
    setEditingId(livestock.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المواشي؟')) {
      saveLivestocks(livestocks.filter((item) => item.id !== id));
      toast.success('تم حذف المواشي بنجاح');
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

  const totalLivestock = livestocks.reduce((sum, item) => sum + item.quantity, 0);
  const totalMonthlyFeedCost = livestocks.reduce((sum, item) => sum + item.monthlyFeedCost, 0);
  const totalValue = livestocks.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أنواع المواشي</p>
                <div className="text-3xl font-bold text-green-600 mt-1">{livestocks.length}</div>
              </div>
              <Leaf className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المواشي</p>
                <div className="text-3xl font-bold text-amber-600 mt-1">{totalLivestock}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <div className="text-2xl font-bold text-cyan-600 mt-1">{totalValue.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">DA</p>
              </div>
              <Coins className="w-8 h-8 text-cyan-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تكلفة الغذاء الشهرية</p>
                <div className="text-2xl font-bold text-red-600 mt-1">{totalMonthlyFeedCost.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">DA</p>
              </div>
              <Leaf className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              {editingId ? 'تعديل المواشي' : 'إضافة مواشي جديدة'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Type, Quantity, Age, Health */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="type">نوع المواشي <span className="text-red-500">*</span></Label>
                  <select
                    id="type"
                    name="type"
                    aria-label="اختر نوع المواشي"
                    value={formData.type}
                    onChange={handleTypeChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">اختر النوع</option>
                    {LIVESTOCK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="quantity">الكمية <span className="text-red-500">*</span></Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="age">العمر التقريبي <span className="text-red-500">*</span></Label>
                  <Input
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="مثال: 2 سنة"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="health">الحالة الصحية <span className="text-red-500">*</span></Label>
                  <select
                    id="health"
                    name="health"
                    aria-label="اختر الحالة الصحية"
                    value={formData.health}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">اختر الحالة</option>
                    {HEALTH_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Purpose, Product Type, Weight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="purpose">الغرض من التربية <span className="text-red-500">*</span></Label>
                  <select
                    id="purpose"
                    name="purpose"
                    aria-label="اختر غرض التربية"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">اختر الغرض</option>
                    {PURPOSE_OPTIONS.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="productType">نوع الإنتاج</Label>
                  <select
                    id="productType"
                    name="productType"
                    aria-label="اختر نوع الإنتاج"
                    value={formData.productType}
                    onChange={handleInputChange}
                    disabled={!formData.type}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:bg-gray-100"
                  >
                    <option value="">اختر نوع الإنتاج</option>
                    {formData.type && PRODUCT_TYPES[formData.type]?.map((product) => (
                      <option key={product} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="weight">الوزن التقريبي (كغ)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Row 3: Unit Price, Monthly Feed Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitPrice">سعر الوحدة (DA)</Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="100"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyFeedCost">تكلفة الغذاء الشهرية (DA)</Label>
                  <Input
                    id="monthlyFeedCost"
                    name="monthlyFeedCost"
                    type="number"
                    value={formData.monthlyFeedCost}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="100"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أي معلومات إضافية مهمة (الأمراض السابقة، العلاجات، الخطط المستقبلية، إلخ)"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {editingId ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List of Livestocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">المواشي المسجلة</h3>
          {!isFormOpen && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-4 h-4" />
              إضافة مواشي
            </Button>
          )}
        </div>

        {livestocks.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Leaf className="w-16 h-16 mx-auto text-green-200 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">لا توجد مواشي مسجلة حالياً</p>
              <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة المواشي لتتبع مواردك الزراعية</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                variant="outline"
                className="mt-4 border-green-600 text-green-600 hover:bg-green-50"
              >
                ابدأ بإضافة المواشي
              </Button>
            </CardContent>
          </Card>
        ) : (
          livestocks.map((livestock) => {
            const monthlyProfit = livestock.purpose === 'إنتاج' 
              ? (livestock.quantity * livestock.unitPrice * 0.1) - livestock.monthlyFeedCost 
              : -livestock.monthlyFeedCost;

            return (
              <Card key={livestock.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  {/* Main Row */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">النوع</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{livestock.type}</p>
                      <p className="text-xs text-gray-500 mt-1">الكمية: {livestock.quantity}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">التفاصيل</p>
                      <p className="text-sm text-gray-700 mt-1">العمر: <span className="font-semibold">{livestock.age}</span></p>
                      <p className="text-sm text-gray-700">الوزن: <span className="font-semibold">{livestock.weight || 'غير محدد'}</span> كغ</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">الحالة</p>
                      <p
                        className={`text-sm font-semibold mt-1 ${
                          livestock.health === 'سليم'
                            ? 'text-green-600'
                            : livestock.health === 'مريض'
                            ? 'text-red-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {livestock.health}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">الغرض: {livestock.purpose}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">الإنتاج</p>
                      <p className="text-sm text-gray-700 mt-1">{livestock.productType || 'غير محدد'}</p>
                      <p className="text-xs text-cyan-600 font-semibold mt-1">
                        السعر: {livestock.unitPrice?.toLocaleString() || 0} DA
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(livestock)}
                        className="gap-1 w-full"
                      >
                        <Edit2 className="w-3 h-3" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(livestock.id)}
                        className="gap-1 w-full"
                      >
                        <Trash2 className="w-3 h-3" />
                        حذف
                      </Button>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600">القيمة الإجمالية</p>
                        <p className="text-lg font-bold text-blue-600 mt-1">
                          {(livestock.quantity * livestock.unitPrice).toLocaleString()} DA
                        </p>
                      </div>

                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600">تكلفة الغذاء الشهرية</p>
                        <p className="text-lg font-bold text-orange-600 mt-1">
                          {livestock.monthlyFeedCost?.toLocaleString() || 0} DA
                        </p>
                      </div>

                      <div className={`${monthlyProfit >= 0 ? 'bg-green-50' : 'bg-red-50'} p-3 rounded-lg`}>
                        <p className="text-xs font-semibold text-gray-600">الأرباح الشهرية المتوقعة</p>
                        <p className={`text-lg font-bold mt-1 ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {monthlyProfit.toLocaleString()} DA
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {livestock.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">📝 ملاحظات:</span> {livestock.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
