import React, { useState, useEffect, useMemo } from 'react';
import { Piece, Settings } from '../types';
import { Icon } from './Icons';

interface PieceFormProps {
  piece: Piece | null;
  onSave: (piece: Piece) => void;
  onClose: () => void;
  settings: Settings;
}

const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-graphite dark:text-graphite-light mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2 text-graphite dark:text-snow-white bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-dusty-rose-light focus:border-dusty-rose-light outline-none transition"
    />
  </div>
);

export const PieceForm: React.FC<PieceFormProps> = ({ piece, onSave, onClose, settings }) => {
  const [formData, setFormData] = useState<Omit<Piece, 'id' | 'createdAt'>>({
    name: '',
    category: '',
    photos: [],
    yarnCost: 0,
    accessoriesCost: 0,
    otherCosts: 0,
    timeHours: 0,
    timeMinutes: 0,
    salePrice: 0,
    stock: 1,
  });

  useEffect(() => {
    if (piece) {
      setFormData({
        name: piece.name,
        category: piece.category,
        photos: piece.photos,
        yarnCost: piece.yarnCost,
        accessoriesCost: piece.accessoriesCost,
        otherCosts: piece.otherCosts,
        timeHours: piece.timeHours,
        timeMinutes: piece.timeMinutes,
        salePrice: piece.salePrice,
        stock: piece.stock,
      });
    }
  }, [piece]);
  
  const [useSuggestedPrice, setUseSuggestedPrice] = useState(true);

  const calculations = useMemo(() => {
    const totalMaterialCost = (formData.yarnCost || 0) + (formData.accessoriesCost || 0) + (formData.otherCosts || 0);
    const timeInHours = (formData.timeHours || 0) + ((formData.timeMinutes || 0) / 60);
    const timeCost = timeInHours * settings.hourlyRate;
    const baseCost = totalMaterialCost + timeCost;
    const suggestedPrice = baseCost * (1 + settings.profitMargin / 100);
    return { totalMaterialCost, timeCost, baseCost, suggestedPrice };
  }, [formData, settings]);

  useEffect(() => {
    if (useSuggestedPrice) {
      setFormData(prev => ({ ...prev, salePrice: calculations.suggestedPrice }));
    }
  }, [calculations.suggestedPrice, useSuggestedPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'salePrice') {
        setUseSuggestedPrice(false);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photos: [reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    const finalPiece: Piece = {
      id: piece?.id || new Date().toISOString(),
      createdAt: piece?.createdAt || new Date().toISOString(),
      ...formData,
      photos: formData.photos.length > 0 ? formData.photos : [`https://picsum.photos/seed/${formData.name || 'default'}/400`],
    };
    onSave(finalPiece);
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-center items-center p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-snow-white/80 dark:bg-ink-black/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-300/30 dark:border-gray-600/30">
          <h2 className="text-2xl font-bold text-graphite dark:text-snow-white">{piece ? 'Editar Peça' : 'Adicionar Nova Peça'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20 transition-colors">
            <Icon type="x" className="w-6 h-6 text-graphite dark:text-graphite-light" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col items-center space-y-2">
            <label htmlFor="photo-upload" className="cursor-pointer group">
              <div className="w-32 h-32 rounded-full bg-white/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-400/70 dark:border-gray-600/70 flex items-center justify-center text-center text-graphite/70 dark:text-graphite-light/70 group-hover:border-dusty-rose group-hover:text-dusty-rose transition-colors relative overflow-hidden">
                {formData.photos.length > 0 ? (
                  <img src={formData.photos[0]} alt="Preview da Peça" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs mt-1">Adicionar Foto</span>
                  </div>
                )}
              </div>
            </label>
            <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
             <p className="text-xs text-graphite/60 dark:text-graphite-light/60">Clique no círculo para enviar uma imagem.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-graphite dark:text-snow-white">Detalhes da Peça</p>
              <GlassInput label="Nome da Peça" name="name" value={formData.name} onChange={handleChange} placeholder="Bolsa Sereia em Fio de Malha" />
              <GlassInput label="Categoria" name="category" value={formData.category} onChange={handleChange} placeholder="Bolsas, Amigurumi..." />
               <GlassInput label="Quantidade em Estoque" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} />
            </div>
            
            <div className="space-y-4">
              <p className="text-lg font-semibold text-graphite dark:text-snow-white">Calcular Custo da Peça</p>
              <GlassInput label="Custo de Linhas/Fios (R$)" name="yarnCost" type="number" min="0" step="0.01" value={formData.yarnCost} onChange={handleChange} />
              <GlassInput label="Custo de Acessórios (R$)" name="accessoriesCost" type="number" min="0" step="0.01" value={formData.accessoriesCost} onChange={handleChange} placeholder="Zíperes, botões..." />
              <GlassInput label="Outros Custos (R$)" name="otherCosts" type="number" min="0" step="0.01" value={formData.otherCosts} onChange={handleChange} placeholder="Embalagem, etiquetas..." />
              <div className="grid grid-cols-2 gap-4">
                <GlassInput label="Horas Gastas" name="timeHours" type="number" min="0" value={formData.timeHours} onChange={handleChange} />
                <GlassInput label="Minutos Gastos" name="timeMinutes" type="number" min="0" max="59" value={formData.timeMinutes} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white/40 dark:bg-gray-900/40 rounded-xl border border-gray-300/50 dark:border-gray-600/50 space-y-3">
             <h3 className="text-lg font-bold text-center text-graphite dark:text-snow-white mb-2">Resumo de Valor</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                 <div>
                     <p className="text-xs text-graphite/80 dark:text-graphite-light/80">Custo Material</p>
                     <p className="font-bold text-graphite dark:text-snow-white">{formatCurrency(calculations.totalMaterialCost)}</p>
                 </div>
                 <div>
                     <p className="text-xs text-graphite/80 dark:text-graphite-light/80">Custo Tempo</p>
                     <p className="font-bold text-graphite dark:text-snow-white">{formatCurrency(calculations.timeCost)}</p>
                 </div>
                 <div>
                     <p className="text-xs text-graphite/80 dark:text-graphite-light/80">Custo Base</p>
                     <p className="font-bold text-graphite dark:text-snow-white">{formatCurrency(calculations.baseCost)}</p>
                 </div>
                 <div>
                     <p className="text-xs text-dusty-rose">Preço Sugerido</p>
                     <p className="font-bold text-dusty-rose text-lg">{formatCurrency(calculations.suggestedPrice)}</p>
                 </div>
             </div>
          </div>
          
          <div className="mt-2">
            <GlassInput label="Preço de Venda Definido (R$)" name="salePrice" type="number" min="0" step="0.01" value={formData.salePrice} onChange={handleChange} />
          </div>
        </div>
        
        <div className="p-4 mt-auto border-t border-gray-300/30 dark:border-gray-600/30">
          <button
            onClick={handleSave}
            className="w-full bg-dusty-rose text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all duration-200 shadow-lg"
          >
            Salvar Peça
          </button>
        </div>
      </div>
    </div>
  );
};