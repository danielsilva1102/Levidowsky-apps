
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tab, Settings, Piece, Sale } from './types';
import { BottomNav } from './components/BottomNav';
import { PieceForm } from './components/PieceForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Icon } from './components/Icons';

// --- Helper & Utility Components ---

const Header: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="sticky top-0 z-10 bg-snow-white/80 dark:bg-ink-black/80 backdrop-blur-xl p-4 md:p-6">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-graphite dark:text-snow-white">{title}</h1>
      {children}
    </div>
  </div>
);

const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-graphite dark:text-graphite-light mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-3 text-graphite dark:text-snow-white bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-dusty-rose-light focus:border-dusty-rose-light outline-none transition"
    />
  </div>
);

const PieceCard: React.FC<{ piece: Piece; onAction: () => void; actionLabel: string; actionIcon: React.ReactNode }> = ({ piece, onAction, actionLabel, actionIcon }) => (
  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/30 dark:border-gray-700/50 shadow-md transform hover:-translate-y-1 transition-transform duration-300">
    <img src={piece.photos[0]} alt={piece.name} className="w-full h-40 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg text-graphite dark:text-snow-white truncate">{piece.name}</h3>
      <p className="text-sm text-graphite/70 dark:text-graphite-light/70">{piece.category}</p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xl font-bold text-dusty-rose">{piece.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <p className="text-sm font-medium text-graphite dark:text-graphite-light">Estoque: {piece.stock}</p>
      </div>
       <button onClick={onAction} className="w-full mt-4 bg-dusty-rose text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2">
        {actionIcon}
        <span>{actionLabel}</span>
      </button>
    </div>
  </div>
);

const EmptyState: React.FC<{ message: string; actionLabel: string; onAction: () => void; }> = ({ message, actionLabel, onAction }) => (
    <div className="text-center py-20 px-4">
        <p className="text-graphite/70 dark:text-graphite-light/70 mb-4">{message}</p>
        <button onClick={onAction} className="bg-dusty-rose text-white font-bold py-3 px-6 rounded-xl hover:bg-opacity-90 transition-all shadow-lg">
            {actionLabel}
        </button>
    </div>
);


// --- Main Screens (defined inside App for state access) ---

const SettingsScreen: React.FC<{ settings: Settings; onSave: (s: Settings) => void }> = ({ settings, onSave }) => {
  const [formState, setFormState] = useState(settings);

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: parseFloat(value) || value }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/30 dark:border-gray-700/50">
        <h2 className="text-xl font-bold text-graphite dark:text-snow-white mb-4">O Cérebro do Negócio</h2>
        <div className="space-y-4">
          <GlassInput label="Nome do Ateliê" name="atelierName" value={formState.atelierName} onChange={handleChange} placeholder="Meu Ateliê de Crochê"/>
          <GlassInput label="Quanto vale a sua hora de trabalho? (R$)" name="hourlyRate" type="number" min="0" step="0.01" value={formState.hourlyRate} onChange={handleChange} />
          <GlassInput label="Margem de Lucro Desejada (%)" name="profitMargin" type="number" min="0" value={formState.profitMargin} onChange={handleChange} />
          <button onClick={() => onSave(formState)} className="w-full mt-4 bg-dusty-rose text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all duration-200 shadow-lg">
            Salvar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);

  // --- State Management ---
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('ponto-de-valor-settings');
    return saved ? JSON.parse(saved) : { atelierName: 'Meu Ateliê', hourlyRate: 20, profitMargin: 100 };
  });

  const [pieces, setPieces] = useState<Piece[]>(() => {
    const saved = localStorage.getItem('ponto-de-valor-pieces');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('ponto-de-valor-sales');
    return saved ? JSON.parse(saved) : [];
  });
  
  // --- Data Persistence ---
  useEffect(() => {
    localStorage.setItem('ponto-de-valor-settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('ponto-de-valor-pieces', JSON.stringify(pieces));
  }, [pieces]);
  useEffect(() => {
    localStorage.setItem('ponto-de-valor-sales', JSON.stringify(sales));
  }, [sales]);
  
  // --- Handlers ---
  const handleSavePiece = useCallback((piece: Piece) => {
    setPieces(prev => {
      const exists = prev.find(p => p.id === piece.id);
      if (exists) {
        return prev.map(p => p.id === piece.id ? piece : p);
      }
      return [...prev, piece];
    });
    setFormOpen(false);
    setEditingPiece(null);
  }, []);

  const handleRegisterSale = useCallback((piece: Piece) => {
    if (piece.stock <= 0) return;

    const totalMaterialCost = piece.yarnCost + piece.accessoriesCost + piece.otherCosts;
    const timeInHours = piece.timeHours + (piece.timeMinutes / 60);
    const timeCost = timeInHours * settings.hourlyRate;
    const baseCost = totalMaterialCost + timeCost;
    
    const newSale: Sale = {
      id: new Date().toISOString(),
      pieceId: piece.id,
      pieceName: piece.name,
      piecePhoto: piece.photos[0],
      quantity: 1,
      salePrice: piece.salePrice,
      baseCost: baseCost,
      profit: piece.salePrice - baseCost,
      date: new Date().toISOString(),
    };

    setSales(prev => [...prev, newSale]);
    setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, stock: p.stock - 1 } : p));
  }, [settings.hourlyRate]);

  const handleDeletePiece = useCallback((pieceId: string) => {
    if (window.confirm("Tem certeza que deseja apagar esta peça? Esta ação não pode ser desfeita.")) {
      setPieces(prev => prev.filter(p => p.id !== pieceId));
      // Also remove associated sales to avoid orphaned data? For simplicity, we won't.
    }
  }, []);
  
  const openFormForNew = () => {
    setEditingPiece(null);
    setFormOpen(true);
  };
  
  const openFormForEdit = (piece: Piece) => {
    setEditingPiece(piece);
    setFormOpen(true);
  };

  const salesPieces = useMemo(() => pieces.filter(p => p.stock > 0), [pieces]);

  // --- Render Logic ---
  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <>
            <Header title="Minhas Peças">
              <button onClick={openFormForNew} className="p-2 rounded-full bg-dusty-rose text-white shadow-lg hover:bg-opacity-90 transition">
                <Icon type="plus" className="w-6 h-6" />
              </button>
            </Header>
            {pieces.length === 0 ? (
                <EmptyState message="Você ainda não cadastrou nenhuma peça." actionLabel="Adicionar primeira peça" onAction={openFormForNew} />
            ) : (
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pieces.map(p => (
                    <div key={p.id} className="relative group">
                        <PieceCard piece={p} onAction={() => openFormForEdit(p)} actionLabel="Editar Detalhes" actionIcon={<div />} />
                        <button onClick={() => handleDeletePiece(p.id)} className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon type="trash" className="w-5 h-5" />
                        </button>
                    </div>
                    ))}
                </div>
            )}
          </>
        );
      case 'sales':
        return (
          <>
            <Header title="Registrar Venda" />
             {salesPieces.length === 0 ? (
                <EmptyState message="Nenhuma peça em estoque para vender." actionLabel="Cadastrar nova peça" onAction={() => {
                    openFormForNew();
                    setActiveTab('inventory');
                }} />
            ) : (
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salesPieces.map(p => (
                        <PieceCard key={p.id} piece={p} onAction={() => handleRegisterSale(p)} actionLabel="Vender 1 Unidade" actionIcon={<Icon type="sales" className="w-5 h-5"/>} />
                    ))}
                </div>
            )}
          </>
        );
      case 'results':
        return (
          <>
            <Header title="Resultados" />
            <ResultsDashboard sales={sales} pieces={pieces} />
          </>
        );
      case 'settings':
        return (
          <>
            <Header title="Ajustes" />
            <SettingsScreen settings={settings} onSave={setSettings} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-graphite dark:text-graphite-light pb-28">
      <main>
        {renderContent()}
      </main>
      
      {isFormOpen && (
        <PieceForm piece={editingPiece} onSave={handleSavePiece} onClose={() => setFormOpen(false)} settings={settings} />
      )}
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
