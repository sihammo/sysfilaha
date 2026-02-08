import { useState } from 'react';
import { Sprout, User, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { User as UserType } from '../App';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [activityType, setActivityType] = useState<'crops' | 'livestock' | 'both'>('both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && farmName) {
      const user: UserType = {
        id: Date.now().toString(),
        name,
        farmName,
        activityType,
      };
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Sprout className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">منصة الفلاح</CardTitle>
          <CardDescription className="text-base">
            إدارة ذكية وشاملة للنشاطات الفلاحية بالجزائر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم الكامل
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                اسم المزرعة
              </Label>
              <Input
                id="farmName"
                type="text"
                placeholder="أدخل اسم المزرعة"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-3">
              <Label>نوع النشاط</Label>
              <RadioGroup
                value={activityType}
                onValueChange={(value) => setActivityType(value as 'crops' | 'livestock' | 'both')}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 space-x-reverse bg-green-50 p-3 rounded-lg">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="cursor-pointer flex-1">
                    زراعة وتربية حيوانية
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-amber-50 p-3 rounded-lg">
                  <RadioGroupItem value="crops" id="crops" />
                  <Label htmlFor="crops" className="cursor-pointer flex-1">
                    زراعة فقط
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-blue-50 p-3 rounded-lg">
                  <RadioGroupItem value="livestock" id="livestock" />
                  <Label htmlFor="livestock" className="cursor-pointer flex-1">
                    تربية حيوانية فقط
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
              ابدأ الآن
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
