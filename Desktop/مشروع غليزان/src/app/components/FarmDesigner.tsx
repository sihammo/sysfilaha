import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
    Grid3X3,
    Map as MapIcon,
    Plus,
    Trash2,
    Lightbulb,
    Info,
    ChevronRight,
    ChevronLeft,
    Settings,
    Waves,
    Wind,
    Sun,
    Brain
} from "lucide-react";
import { toast } from "sonner";

interface CropTile {
    id: string;
    type: string;
    name: string;
    color: string;
    icon: string;
    description: string;
}

const DEFAULT_CROPS: CropTile[] = [
    { id: "wheat", type: "حبوب", name: "قمح", color: "#F5DEB3", icon: "🌾", description: "حبوب صلبة" },
    { id: "tomato", type: "خضروات", name: "طماطم", color: "#FF6347", icon: "🍅", description: "شتلات طماطم" },
    { id: "potato", type: "جذور", name: "بطاطا", color: "#D2B48C", icon: "🥔", description: "درنات بطاطس" },
    { id: "carrot", type: "خضروات", name: "جزر", color: "#FFA500", icon: "🥕", description: "بذور جزر" },
    { id: "corn", type: "حبوب", name: "ذرة", color: "#FFD700", icon: "🌽", description: "بذور ذرة" },
    { id: "lettuce", type: "خضروات", name: "خس", color: "#90EE90", icon: "🥬", description: "شتلات خس" },
];

export default function FarmDesigner() {
    const [gridSize, setGridSize] = useState({ rows: 10, cols: 10 });
    const [landDimensions, setLandDimensions] = useState({ width: 100, length: 100 }); // in meters
    const [selectedCrop, setSelectedCrop] = useState<CropTile | null>(null);
    const [selectedCropsIds, setSelectedCropsIds] = useState<Set<string>>(new Set());
    const [crops, setCrops] = useState<CropTile[]>(DEFAULT_CROPS);
    const [grid, setGrid] = useState<Record<string, CropTile>>({});
    const [isConfiguring, setIsConfiguring] = useState(true);
    const [isMouseDown, setIsMouseDown] = useState(false);

    // New Crop Form State
    const [isAddingCrop, setIsAddingCrop] = useState(false);
    const [newCrop, setNewCrop] = useState({ name: "", icon: "🌱", color: "#4CAF50" });

    const cellWidth = useMemo(() => landDimensions.width / gridSize.cols, [landDimensions.width, gridSize.cols]);
    const cellLength = useMemo(() => landDimensions.length / gridSize.rows, [landDimensions.length, gridSize.rows]);

    const handleTileAction = (row: number, col: number) => {
        const key = `${row}-${col}`;

        if (selectedCropsIds.size > 0) {
            // If multiple selected, we could pick one based on position for manual too, 
            // but let's stick to the first selected for manual if not clicking a specifically selected one
            const cropsToUse = crops.filter(c => selectedCropsIds.has(c.id));
            const cropToIndex = (row * gridSize.cols + col) % cropsToUse.length;
            setGrid(prev => ({ ...prev, [key]: cropsToUse[cropToIndex] }));
        } else if (selectedCrop) {
            setGrid(prev => ({ ...prev, [key]: selectedCrop }));
        } else {
            setGrid(prev => {
                const newGrid = { ...prev };
                delete newGrid[key];
                return newGrid;
            });
        }
    };

    const smartFill = () => {
        const selectedList = crops.filter(c => selectedCropsIds.has(c.id));
        if (selectedList.length === 0 && !selectedCrop) {
            return toast.error("يرجى اختيار نوع أو عدة أنواع من الحبوب أولاً");
        }

        const cropsToUse = selectedList.length > 0 ? selectedList : [selectedCrop!];
        const newGrid = { ...grid };
        let filledCount = 0;

        for (let r = 0; r < gridSize.rows; r++) {
            for (let c = 0; c < gridSize.cols; c++) {
                const key = `${r}-${c}`;
                // Smart pattern: Leave paths every 4 rows/cols
                if (r % 4 === 0 || c % 4 === 0) continue;

                if (!newGrid[key]) {
                    // Pick crop from the selection based on index for diversity
                    const cropIndex = (filledCount) % cropsToUse.length;
                    newGrid[key] = cropsToUse[cropIndex];
                    filledCount++;
                }
            }
        }

        setGrid(newGrid);
        if (filledCount > 0) {
            toast.success(`تم توزيع ${filledCount} شتلة من ${cropsToUse.length} أنواع ذكياً`);
        } else {
            toast.info("لا توجد مساحات فارغة مناسبة");
        }
    };

    const toggleCropSelection = (cropId: string) => {
        setSelectedCropsIds(prev => {
            const next = new Set(prev);
            if (next.has(cropId)) {
                next.delete(cropId);
            } else {
                next.add(cropId);
            }
            return next;
        });
        // Clear single selection when using multi-selection
        setSelectedCrop(null);
    };

    const addCustomCrop = () => {
        if (!newCrop.name) return toast.error("يرجى إدخال اسم المحصول");
        const crop: CropTile = {
            id: `custom-${Date.now()}`,
            type: "خاص",
            name: newCrop.name,
            icon: newCrop.icon,
            color: newCrop.color,
            description: "محصول مخصص"
        };
        setCrops(prev => [...prev, crop]);
        setIsAddingCrop(false);
        setNewCrop({ name: "", icon: "🌱", color: "#4CAF50" });
        toast.success("تمت إضافة المحصول الجديد لصندوق البذور");
    };

    const clearGrid = () => {
        if (confirm("هل أنت متأكد من مسح المخطط بالكامل؟")) {
            setGrid({});
        }
    };

    const aiAdvice = useMemo(() => {
        const cropGroups: Record<string, { count: number, name: string, id: string }> = {};
        Object.values(grid).forEach(crop => {
            if (!cropGroups[crop.id]) cropGroups[crop.id] = { count: 0, name: crop.name, id: crop.id };
            cropGroups[crop.id].count++;
        });

        const advices = [];
        if (Object.keys(grid).length === 0) {
            advices.push(`أرضك بمساحة ${landDimensions.width * landDimensions.length} متر مربع (${(landDimensions.width * landDimensions.length / 10000).toFixed(2)} هكتار). اختر بذرة وابدأ بالزراعة!`);
        } else {
            Object.values(cropGroups).forEach(group => {
                const area = group.count * (cellWidth * cellLength);
                // Simple seed calculation logic: seeds per m2
                let seedsPerM2 = 20; // default for wheat
                if (group.id === "tomato") seedsPerM2 = 4;
                if (group.id === "potato") seedsPerM2 = 5;
                if (group.id === "carrot") seedsPerM2 = 50;

                const seedsNeeded = Math.ceil(area * seedsPerM2);

                advices.push(`مساحة ${group.name}: ${area.toFixed(1)}م². تحتاج لزراعتها حوالي ${seedsNeeded.toLocaleString()} بذرة/شتلة.`);
                advices.push(`الاستهلاك المائي التقديري لـ ${group.name}: ${Math.ceil(area * 0.8)} لتر/يوم.`);
            });

            if (cropGroups["wheat"] && cropGroups["corn"]) {
                advices.push("نصيحة: افصل بين القمح والذرة بممر عريض (3 متر) لضمان عدم تداخل الجذور.");
            }

            advices.push(`كل مربع تنقر عليه يزرع مساحة ${(cellWidth * cellLength).toFixed(1)} متر مربع.`);
        }
        return advices;
    }, [grid, landDimensions, cellWidth, cellLength]);

    return (
        <div className="space-y-6" onMouseUp={() => setIsMouseDown(false)}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#2D5A27]">الزراعة التفاعلية الذكية</h2>
                    <p className="text-gray-600">اختر نوع البذور وقم بالزراعة على المخطط كما تحب</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsConfiguring(!isConfiguring)}
                        className="rounded-xl border-[var(--agri-green-soft)] text-[var(--agri-green-growth)]"
                    >
                        <Settings className="w-4 h-4 ml-2" />
                        ضبط الأبعاد
                    </Button>
                    <Button
                        variant="outline"
                        onClick={clearGrid}
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4 ml-2" />
                        تفريغ المخطط
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {(isConfiguring || isAddingCrop) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                    >
                        {isConfiguring && (
                            <Card className="border-none shadow-sm bg-[var(--agri-beige-warm)] border border-[var(--agri-green-soft)]/20">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label>عرض الحقل (متر)</Label>
                                            <Input
                                                type="number"
                                                value={landDimensions.width}
                                                onChange={e => setLandDimensions(p => ({ ...p, width: parseInt(e.target.value) || 1 }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>طول الحقل (متر)</Label>
                                            <Input
                                                type="number"
                                                value={landDimensions.length}
                                                onChange={e => setLandDimensions(p => ({ ...p, length: parseInt(e.target.value) || 1 }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>تقسيمات الزراعة (دقة المربعات)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={gridSize.rows}
                                                    onChange={e => setGridSize(p => ({ ...p, rows: parseInt(e.target.value) || 1, cols: parseInt(e.target.value) || 1 }))}
                                                    className="rounded-xl"
                                                />
                                                <span className="text-xs text-slate-400">قسم</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setIsConfiguring(false)}
                                            className="bg-[var(--agri-green-growth)] rounded-xl py-6"
                                        >
                                            تثبيتDimensions وحساب المساحة
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isAddingCrop && (
                            <Card className="border-none shadow-sm bg-emerald-50 border border-emerald-100">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label>اسم المحصول / الحبوب</Label>
                                            <Input
                                                placeholder="مثلاً: شعير، فلفل..."
                                                value={newCrop.name}
                                                onChange={e => setNewCrop(p => ({ ...p, name: e.target.value }))}
                                                className="rounded-xl bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>الرمز (Emoji)</Label>
                                            <Input
                                                value={newCrop.icon}
                                                onChange={e => setNewCrop(p => ({ ...p, icon: e.target.value }))}
                                                className="rounded-xl bg-white text-center text-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>اللون المميز</Label>
                                            <Input
                                                type="color"
                                                value={newCrop.color}
                                                onChange={e => setNewCrop(p => ({ ...p, color: e.target.value }))}
                                                className="rounded-xl h-10 p-1 bg-white cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={addCustomCrop}
                                                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl grow"
                                            >
                                                إضافة للصندوق
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAddingCrop(false)}
                                                className="rounded-xl"
                                            >
                                                إلغاء
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Toolbox */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                صندوق البذور
                            </CardTitle>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-[var(--agri-green-growth)] hover:bg-emerald-50 rounded-lg p-1 h-8 px-2"
                                onClick={() => setIsAddingCrop(true)}
                            >
                                <Plus className="w-4 h-4 ml-1" />
                                إضافة نوع
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                                {crops.map(crop => {
                                    const isSelected = selectedCropsIds.has(crop.id);
                                    return (
                                        <button
                                            key={crop.id}
                                            onClick={() => toggleCropSelection(crop.id)}
                                            className={`
                                                p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 relative
                                                ${isSelected
                                                    ? "border-[var(--agri-green-growth)] bg-[var(--agri-green-soft)]/20 scale-105"
                                                    : "border-slate-50 hover:border-slate-200 bg-slate-50/50"
                                                }
                                            `}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--agri-green-growth)] rounded-full flex items-center justify-center text-[8px] text-white">
                                                    ✓
                                                </div>
                                            )}
                                            <span className="text-2xl">{crop.icon}</span>
                                            <span className="text-xs font-bold truncate w-full text-center">{crop.name}</span>
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => {
                                        setSelectedCrop(null);
                                        setSelectedCropsIds(new Set());
                                    }}
                                    className={`
                    p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 col-span-2
                    ${selectedCrop === null && selectedCropsIds.size === 0
                                            ? "border-red-400 bg-red-50"
                                            : "border-slate-50 hover:border-slate-200 bg-slate-50/50"
                                        }
                  `}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-bold">إلغاء التحديد / ممحاة</span>
                                </button>
                            </div>

                            <Button
                                onClick={smartFill}
                                disabled={selectedCropsIds.size === 0 && !selectedCrop}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 py-6 shadow-lg shadow-emerald-900/10"
                            >
                                <Brain className="w-5 h-5" />
                                {selectedCropsIds.size > 1 ? "توزيع زراعة تداخلية" : "توزيع ذكي للمحصول"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-amber-50 border border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                إحصائيات البذور (AI)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {aiAdvice.map((advice, i) => (
                                <div key={i} className="flex gap-2 text-sm text-amber-800 bg-white/50 p-3 rounded-xl">
                                    <span className="shrink-0 text-amber-500">•</span>
                                    <p>{advice}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="bg-slate-200/50 p-4 rounded-xl text-xs text-slate-600 flex items-start gap-2 italic">
                        <Info className="w-4 h-4 text-slate-400 shrink-0" />
                        تلميح: يمكنك النقر والسحب بالماوس لزراعة مساحات كبيرة بسرعة.
                    </div>
                </div>

                {/* Visualizer Grid */}
                <div className="lg:col-span-3">
                    <Card className="border-none shadow-xl overflow-hidden bg-[#5C4033]/10">
                        <div className="bg-[#5C4033] p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <MapIcon className="w-5 h-5 text-[#D2B48C]" />
                                <span className="font-bold">مخطط زراعة الحقل الذكي</span>
                            </div>
                            <div className="flex gap-4 text-xs font-mono items-center">
                                <span className="bg-white/10 px-2 py-1 rounded">المقياس: 1 مربع = {(cellWidth * cellLength).toFixed(1)}م²</span>
                                <div className="flex items-center gap-1"><Sun className="w-3 h-3 text-yellow-400" /></div>
                            </div>
                        </div>
                        <CardContent className="p-0 overflow-auto max-h-[700px] relative">
                            {/* Meter Markers (Horizontal) */}
                            <div className="flex bg-[#5C4033]/40 text-[10px] text-white/60 font-mono pr-8 select-none">
                                {Array.from({ length: gridSize.cols }).map((_, i) => (
                                    <div key={i} className="flex-1 text-center py-1 border-r border-white/10" style={{ minWidth: "50px" }}>
                                        {Math.round(i * cellWidth)}م
                                    </div>
                                ))}
                                <div className="py-1 px-1">{landDimensions.width}م</div>
                            </div>

                            <div className="flex">
                                {/* Meter Markers (Vertical) */}
                                <div className="flex flex-col bg-[#5C4033]/40 text-[10px] text-white/60 font-mono w-8 select-none">
                                    {Array.from({ length: gridSize.rows }).map((_, i) => (
                                        <div key={i} className="flex-1 flex items-center justify-center border-b border-white/10" style={{ minHeight: "50px" }}>
                                            {Math.round(i * cellLength)}م
                                        </div>
                                    ))}
                                    <div className="h-4 flex items-center justify-center">{landDimensions.length}م</div>
                                </div>

                                <div
                                    className="grid gap-px bg-[#5C4033]/20 p-2 grow select-none"
                                    style={{
                                        gridTemplateColumns: `repeat(${gridSize.cols}, minmax(50px, 1fr))`,
                                    }}
                                    onMouseDown={() => setIsMouseDown(true)}
                                >
                                    {Array.from({ length: gridSize.rows }).map((_, r) => (
                                        Array.from({ length: gridSize.cols }).map((_, c) => {
                                            const key = `${r}-${c}`;
                                            const crop = grid[key];
                                            return (
                                                <motion.div
                                                    key={key}
                                                    whileHover={{ scale: 1.05, zIndex: 10 }}
                                                    onMouseDown={() => handleTileAction(r, c)}
                                                    onMouseEnter={() => isMouseDown && handleTileAction(r, c)}
                                                    className={`
                              aspect-square flex flex-col items-center justify-center cursor-crosshair relative
                              ${crop ? "" : "bg-[#8B4513]/10 hover:bg-[#8B4513]/30"}
                              transition-colors duration-200 border border-[#5C4033]/5
                            `}
                                                    style={{ backgroundColor: crop?.color }}
                                                >
                                                    {crop ? (
                                                        <>
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="text-2xl"
                                                            >
                                                                {crop.icon}
                                                            </motion.span>
                                                            <span className="text-[8px] absolute bottom-1 text-black/40 font-bold uppercase pointer-events-none truncate w-full text-center px-1">
                                                                {crop.name}
                                                            </span>
                                                        </>
                                                    ) : (r % 4 === 0 || c % 4 === 0) && (
                                                        <span className="text-[8px] text-slate-400 opacity-20 pointer-events-none">ممر</span>
                                                    )}
                                                </motion.div>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-600">Σ</div>
                            <div>
                                <p className="font-bold">المساحة المزروعة</p>
                                <p>{(Object.keys(grid).length * cellWidth * cellLength).toFixed(1)} متر مربع من إجمالي {landDimensions.width * landDimensions.length}م²</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-600">⚙</div>
                            <div>
                                <p className="font-bold">دقة التوزيع</p>
                                <p>كل مربع يمثل {cellWidth.toFixed(1)}م × {cellLength.toFixed(1)}م</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function groupNameByTile(id: string) {
    const names: Record<string, string> = {
        wheat: "قمح",
        tomato: "طماطم",
        potato: "بطاطا",
        carrot: "جزر",
        corn: "ذرة",
        lettuce: "خس"
    };
    return names[id] || "";
}
