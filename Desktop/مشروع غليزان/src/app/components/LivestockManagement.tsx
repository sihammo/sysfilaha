import { useState } from 'react';
import { Plus, Trash2, Calendar, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Livestock } from '../App';

interface LivestockManagementProps {
  livestock: Livestock[];
  setLivestock: (livestock: Livestock[]) => void;
}

export function LivestockManagement({ livestock, setLivestock }: LivestockManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newLivestock, setNewLivestock] = useState<Partial<Livestock>>({
    type: 'sheep',
    category: 'female',
    count: 1,
    purpose: 'breeding',
    acquisitionDate: new Date().toISOString().split('T')[0],
    costs: {
      feed: 0,
      medicine: 0,
      vaccination: 0,
      labor: 0,
    },
    production: {},
  });

  const handleAddLivestock = () => {
    if (newLivestock.count && newLivestock.count > 0) {
      const item: Livestock = {
        id: Date.now().toString(),
        type: newLivestock.type || 'sheep',
        category: newLivestock.category as 'male' | 'female' | 'young' || 'female',
        count: newLivestock.count,
        acquisitionDate: newLivestock.acquisitionDate || new Date().toISOString().split('T')[0],
        purpose: newLivestock.purpose as 'breeding' | 'selling' | 'consumption' || 'breeding',
        customType: newLivestock.customType,
        costs: newLivestock.costs || {
          feed: 0,
          medicine: 0,
          vaccination: 0,
          labor: 0,
        },
        production: newLivestock.production || {},
      };

      setLivestock([...livestock, item]);
      setIsAddDialogOpen(false);
      setNewLivestock({
        type: 'sheep',
        category: 'female',
        count: 1,
        purpose: 'breeding',
        acquisitionDate: new Date().toISOString().split('T')[0],
        costs: {
          feed: 0,
          medicine: 0,
          vaccination: 0,
          labor: 0,
        },
        production: {},
      });
    }
  };

  const handleDeleteLivestock = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الحاشية؟')) {
      setLivestock(livestock.filter(item => item.id !== id));
    }
  };

  const getTypeLabel = (item: Livestock) => {
    if (item.type === 'other' && item.customType) return item.customType;
    switch (item.type) {
      case 'sheep': return 'أغنام';
      case 'cattle': return 'أبقار';
      case 'poultry': return 'دواجن';
      case 'goats': return 'ماعز';
      case 'rabbits': return 'أرانب';
      case 'horses': return 'خيول';
      case 'camels': return 'إبل';
      case 'bees': return 'نحل';
      case 'fish': return 'أسماك';
      case 'other': return 'أخرى';
      default: return item.type;
    }
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'breeding': return 'تربية';
      case 'selling': return 'بيع';
      case 'consumption': return 'استهلاك';
      default: return purpose;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'male': return 'ذكور';
      case 'female': return 'إناث';
      case 'young': return 'صغار';
      default: return category;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sheep': return '🐑';
      case 'cattle': return '🐄';
      case 'poultry': return '🐔';
      case 'goats': return '🐐';
      case 'rabbits': return '🐇';
      case 'horses': return '🐎';
      case 'camels': return '🐪';
      case 'bees': return '🐝';
      case 'fish': return '🐟';
      default: return '🐾';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#2E7D32]">إدارة الثروة الحيوانية</h2>
          <p className="text-gray-600">تتبع قطيعك وإنتاجيتك الحيوانية وكل ما يتعلق بها</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-xl shadow-lg transition-all hover:scale-105">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مواشي
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#2E7D32]">إضافة مواشي جديدة</DialogTitle>
              <DialogDescription>
                أدخل معلومات الثروة الحيوانية والتكاليف والغرض من التربية
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع الحيوان</Label>
                  <Select
                    value={newLivestock.type}
                    onValueChange={(value: string) => setNewLivestock({ ...newLivestock, type: value as any, customType: value === 'other' ? '' : undefined })}
                  >
                    <SelectTrigger className="rounded-xl border-green-100 focus:ring-[#2E7D32]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sheep">أغنام 🐑</SelectItem>
                      <SelectItem value="cattle">أبقار 🐄</SelectItem>
                      <SelectItem value="goats">ماعز 🐐</SelectItem>
                      <SelectItem value="poultry">دواجن 🐔</SelectItem>
                      <SelectItem value="rabbits">أرانب 🐇</SelectItem>
                      <SelectItem value="horses">خيول 🐎</SelectItem>
                      <SelectItem value="camels">إبل 🐪</SelectItem>
                      <SelectItem value="bees">نحل 🐝</SelectItem>
                      <SelectItem value="fish">أسماك 🐟</SelectItem>
                      <SelectItem value="other">أخرى 🐾</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">الغرض من التربية</Label>
                  <Select
                    value={newLivestock.purpose}
                    onValueChange={(value: string) => setNewLivestock({ ...newLivestock, purpose: value as any })}
                  >
                    <SelectTrigger className="rounded-xl border-green-100 focus:ring-[#2E7D32]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breeding">تربية</SelectItem>
                      <SelectItem value="selling">بيع</SelectItem>
                      <SelectItem value="consumption">استهلاك شخصي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newLivestock.type === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="customType">اسم الحيوان</Label>
                  <Input
                    id="customType"
                    placeholder="مثال: أوز، بط، غزلان..."
                    value={newLivestock.customType}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({ ...newLivestock, customType: e.target.value })}
                    className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">التصنيف</Label>
                  <Select
                    value={newLivestock.category}
                    onValueChange={(value: string) => setNewLivestock({ ...newLivestock, category: value as any })}
                  >
                    <SelectTrigger className="rounded-xl border-green-100 focus:ring-[#2E7D32]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكور</SelectItem>
                      <SelectItem value="female">إناث</SelectItem>
                      <SelectItem value="young">صغار / فلاليس</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="count">العدد</Label>
                  <Input
                    id="count"
                    type="number"
                    value={newLivestock.count}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({ ...newLivestock, count: parseInt(e.target.value) || 0 })}
                    className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">تاريخ الاقتناء</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={newLivestock.acquisitionDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({ ...newLivestock, acquisitionDate: e.target.value })}
                  className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="border-t border-green-50 pt-4">
                <h4 className="font-semibold text-[#2E7D32] mb-3">التكاليف المالية</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feed">تكلفة الأعلاف (دج)</Label>
                    <Input
                      id="feed"
                      type="number"
                      value={newLivestock.costs?.feed}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({
                        ...newLivestock,
                        costs: { ...newLivestock.costs!, feed: parseFloat(e.target.value) || 0 }
                      })}
                      className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicine">تكلفة الأدوية (دج)</Label>
                    <Input
                      id="medicine"
                      type="number"
                      value={newLivestock.costs?.medicine}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({
                        ...newLivestock,
                        costs: { ...newLivestock.costs!, medicine: parseFloat(e.target.value) || 0 }
                      })}
                      className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vaccination">تكلفة التلقيح (دج)</Label>
                    <Input
                      id="vaccination"
                      type="number"
                      value={newLivestock.costs?.vaccination}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({
                        ...newLivestock,
                        costs: { ...newLivestock.costs!, vaccination: parseFloat(e.target.value) || 0 }
                      })}
                      className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labor">تكلفة العمال (دج)</Label>
                    <Input
                      id="labor"
                      type="number"
                      value={newLivestock.costs?.labor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({
                        ...newLivestock,
                        costs: { ...newLivestock.costs!, labor: parseFloat(e.target.value) || 0 }
                      })}
                      className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-green-50 pt-4">
                <h4 className="font-semibold text-[#2E7D32] mb-3">الإنتاج (اختياري)</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(newLivestock.type === 'cattle' || newLivestock.type === 'sheep' || newLivestock.type === 'goats') && (
                    <div className="space-y-2">
                      <Label htmlFor="milk">إنتاج الحليب (لتر)</Label>
                      <Input
                        id="milk"
                        type="number"
                        value={newLivestock.production?.milk || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({
                          ...newLivestock,
                          production: { ...newLivestock.production, milk: parseFloat(e.target.value) || 0 }
                        })}
                        className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                      />
                    </div>
                  )}
                  {(newLivestock.type === 'poultry' || newLivestock.type === 'other') && (
                    <div className="space-y-2">
                      <Label htmlFor="eggs">إنتاج البيض (وحدة)</Label>
                      <Input
                        id="eggs"
                        type="number"
                        value={newLivestock.production?.eggs || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({
                          ...newLivestock,
                          production: { ...newLivestock.production, eggs: parseFloat(e.target.value) || 0 }
                        })}
                        className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="weight">الوزن الإجمالي (كغ)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={newLivestock.production?.weight || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLivestock({
                        ...newLivestock,
                        production: { ...newLivestock.production, weight: parseFloat(e.target.value) || 0 }
                      })}
                      className="rounded-xl border-green-100 focus:ring-[#2E7D32]"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleAddLivestock} className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] py-6 rounded-2xl text-lg font-bold shadow-xl">
                إضافة الحاشية للقطيع
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {livestock.map((item) => {
          const totalCost = item.costs.feed + item.costs.medicine + item.costs.vaccination + item.costs.labor;
          const costPerAnimal = item.count > 0 ? (totalCost / item.count).toFixed(2) : 0;

          return (
            <Card key={item.id} className="hover:shadow-2xl transition-all duration-300 border-none bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden group">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-transparent">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-4xl">{getTypeIcon(item.type)}</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">{getTypeLabel(item)}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{getCategoryLabel(item.category)}</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{getPurposeLabel(item.purpose)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 rounded-full text-red-100 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteLivestock(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>بداية التربية: {new Date(item.acquisitionDate).toLocaleDateString('ar-DZ')}</span>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-[#2E7D32] p-4 rounded-2xl border border-green-200 text-white shadow-lg shadow-green-900/10">
                  <p className="text-sm opacity-80 mb-1 font-medium">العدد الإجمالي</p>
                  <p className="text-3xl font-black">{item.count} <span className="text-lg opacity-80 font-normal">رأس</span></p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">إجمالي التكاليف</p>
                    <p className="font-bold text-red-600">{totalCost.toLocaleString('ar-DZ')} دج</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">التكلفة / رأس</p>
                    <p className="font-bold text-gray-700">{costPerAnimal} دج</p>
                  </div>
                </div>

                {(item.production?.milk || item.production?.eggs || item.production?.weight) && (
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-green-600" />
                      <h4 className="text-sm font-bold text-gray-700">إحصائيات الإنتاج</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {item.production.milk && (
                        <div className="flex justify-between items-center bg-blue-50/50 px-3 py-2 rounded-xl">
                          <span className="text-xs text-blue-700">إنتاج الحليب</span>
                          <span className="font-bold text-blue-900 text-sm">{item.production.milk} لتر</span>
                        </div>
                      )}
                      {item.production.eggs && (
                        <div className="flex justify-between items-center bg-amber-50/50 px-3 py-2 rounded-xl">
                          <span className="text-xs text-amber-700">إنتاج البيض</span>
                          <span className="font-bold text-amber-900 text-sm">{item.production.eggs} وحدة</span>
                        </div>
                      )}
                      {item.production.weight && (
                        <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl">
                          <span className="text-xs text-gray-600">الوزن الإجمالي</span>
                          <span className="font-bold text-gray-900 text-sm">{item.production.weight} كغ</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {livestock.length === 0 && (
        <Card className="border-2 border-dashed border-green-200 bg-transparent rounded-[32px] overflow-hidden">
          <CardContent className="py-20 text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-[#2E7D32]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">سجل مواشيك الآن</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              ابدأ بإضافة أول مجموعة من المواشي لتبدأ في تتبع التكاليف والإنتاج بشكل ذكي ومحترف
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#2E7D32] hover:bg-[#1B5E20] px-8 py-6 rounded-2xl text-lg font-bold">
              إضافة أول حاشية
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
