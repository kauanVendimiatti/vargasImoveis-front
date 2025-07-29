import React, { useState, useEffect } from 'react';

// URL base da API (do seu arquivo .env.local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const CONTRATOS_API_URL = `${API_BASE_URL}/api/contratos/`;
// URLs para preencher os formulários
const IMOVEIS_API_URL = `${API_BASE_URL}/api/imoveis/`;
const LOCADORES_API_URL = `${API_BASE_URL}/api/locadores/`;
const LOCATARIOS_API_URL = `${API_BASE_URL}/api/locatarios/`;


// =================================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =================================================================================
function ContratosPage() {
    // --- ESTADOS (STATE) ---
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'details' ou 'form'
    const [selectedContrato, setSelectedContrato] = useState(null);

    // --- LÓGICA DE DADOS (API) ---
    const fetchContratos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(CONTRATOS_API_URL);
            if (!response.ok) throw new Error('Falha ao buscar dados da API de Contratos.');
            const data = await response.json();
            setContratos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContratos();
    }, []);

    // --- MANIPULADORES DE EVENTOS (HANDLERS) ---
    const handleOpenDetails = (contrato) => {
        setSelectedContrato(contrato);
        setModalType('details');
        setIsModalOpen(true);
    };

    const handleOpenForm = (contrato = null) => {
        setSelectedContrato(contrato);
        setModalType('form');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedContrato(null);
        setModalType(null);
    };

    const handleDelete = async (contratoId) => {
        if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
            try {
                await fetch(`${CONTRATOS_API_URL}${contratoId}/`, { method: 'DELETE' });
                handleCloseModal();
                await fetchContratos();
            } catch (err) {
                alert(`Erro ao excluir: ${err.message}`);
            }
        }
    };

    const handleFormSuccess = () => {
        handleCloseModal();
        fetchContratos();
    };
    
    // --- RENDERIZAÇÃO PRINCIPAL ---
    if (error) return <div className="p-8 text-center text-red-400">Erro: {error}</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Gestão de Contratos</h2>
                <button onClick={() => handleOpenForm(null)} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition">+ Novo Contrato</button>
            </div>

            {loading ? <div className="text-center text-gray-500 py-10">Carregando...</div> : (
                <ContratosTable contratos={contratos} onOpenDetails={handleOpenDetails} />
            )}
            
            {isModalOpen && (
                <Modal onClose={handleCloseModal} title={
                    modalType === 'form' 
                        ? (selectedContrato ? 'Editar Contrato' : 'Adicionar Novo Contrato') 
                        : `Detalhes do Contrato #${selectedContrato.id}`
                }>
                    {modalType === 'details' && (
                        <ContratoDetails 
                            contrato={selectedContrato} 
                            onEdit={() => handleOpenForm(selectedContrato)}
                            onDelete={() => handleDelete(selectedContrato.id)}
                            onClose={handleCloseModal}
                        />
                    )}
                    {modalType === 'form' && (
                        <ContratoForm 
                            contratoData={selectedContrato} 
                            onSuccess={handleFormSuccess}
                            onClose={handleCloseModal}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default ContratosPage;

// =================================================================================
// SUB-COMPONENTES
// =================================================================================

function ContratosTable({ contratos, onOpenDetails }) {
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-900 text-gray-400 uppercase">
                    <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Imóvel</th>
                        <th className="p-4">Locatário</th>
                        <th className="p-4">Status</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {contratos.map(contrato => (
                        <tr key={contrato.id} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="p-4 text-gray-200">{contrato.id}</td>
                            <td className="p-4 text-gray-400 truncate max-w-sm">{contrato.imovel}</td>
                            <td className="p-4 text-gray-400">{contrato.locatario}</td>
                            <td className="p-4 text-gray-400">{contrato.status_contrato}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => onOpenDetails(contrato)} className="text-orange-500 hover:text-orange-400 font-semibold">Ver Detalhes</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Modal({ children, onClose, title }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-gray-800 rounded-xl shadow-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ContratoDetails({ contrato, onEdit, onDelete, onClose }) {
    return (
        <>
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-300">
                    {Object.entries(contrato).map(([key, value]) => (
                        <div key={key}>
                            <p className="text-sm text-gray-500 font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="text-lg">{String(value) || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-700 flex justify-between items-center">
                <button onClick={onDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Deletar</button>
                <div>
                    <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 mr-2">Fechar</button>
                    <button onClick={onEdit} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600">Editar</button>
                </div>
            </div>
        </>
    );
}

function ContratoForm({ contratoData, onSuccess, onClose }) {
    const [formData, setFormData] = useState(contratoData || {
        imovel_id: '', locador_id: '', locatario_id: '',
        data_inicio: '', data_fim: '', valor_aluguel: '', valor_deposito: '',
        tipo_garantia: 'Caução', status_contrato: 'Ativo', data_assinatura: '',
        data_vencimento_pagamento: '', multa_rescisoria: '', clausulas_especificas: ''
    });
    const [formOptions, setFormOptions] = useState({ imoveis: [], locadores: [], locatarios: [] });
    const [formError, setFormError] = useState('');

    // Busca as listas para preencher os <select>s
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [imoveisRes, locadoresRes, locatariosRes] = await Promise.all([
                    fetch(IMOVEIS_API_URL),
                    fetch(LOCADORES_API_URL),
                    fetch(LOCATARIOS_API_URL)
                ]);
                const imoveis = await imoveisRes.json();
                const locadores = await locadoresRes.json();
                const locatarios = await locatariosRes.json();
                setFormOptions({ imoveis, locadores, locatarios });
            } catch (error) {
                setFormError("Não foi possível carregar as opções do formulário.");
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEditing = !!contratoData;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${CONTRATOS_API_URL}${contratoData.id}/` : CONTRATOS_API_URL;
        
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(JSON.stringify(errData));
            }
            onSuccess();
        } catch (err) {
            setFormError(`Erro ao salvar: ${err.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Imóvel</label>
                        <select name="imovel_id" value={formData.imovel_id || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required>
                            <option value="">-- Selecione um Imóvel --</option>
                            {formOptions.imoveis.map(item => (<option key={item.id} value={item.id}>{item.endereco}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Locador (Proprietário)</label>
                        <select name="locador_id" value={formData.locador_id || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required>
                            <option value="">-- Selecione um Locador --</option>
                            {formOptions.locadores.map(item => (<option key={item.id} value={item.id}>{item.nome}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Locatário (Inquilino)</label>
                        <select name="locatario_id" value={formData.locatario_id || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required>
                            <option value="">-- Selecione um Locatário --</option>
                            {formOptions.locatarios.map(item => (<option key={item.id} value={item.id}>{item.nome}</option>))}
                        </select>
                    </div>

                    <div><label className="text-sm text-gray-400">Data de Início</label><input type="date" name="data_inicio" value={formData.data_inicio || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required /></div>
                    <div><label className="text-sm text-gray-400">Data de Fim</label><input type="date" name="data_fim" value={formData.data_fim || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required /></div>
                    <div><label className="text-sm text-gray-400">Data da Assinatura</label><input type="date" name="data_assinatura" value={formData.data_assinatura || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required /></div>
                    <div><label className="text-sm text-gray-400">Dia do Vencimento</label><input type="number" name="data_vencimento_pagamento" value={formData.data_vencimento_pagamento || ''} onChange={handleChange} placeholder="Ex: 5" className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required /></div>

                    <div><label className="text-sm text-gray-400">Valor Aluguel (R$)</label><input type="number" name="valor_aluguel" value={formData.valor_aluguel || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required step="0.01" /></div>
                    <div><label className="text-sm text-gray-400">Valor Depósito (R$)</label><input type="number" name="valor_deposito" value={formData.valor_deposito || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                    <div><label className="text-sm text-gray-400">Multa Rescisória (R$)</label><input type="number" name="multa_rescisoria" value={formData.multa_rescisoria || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                    <div>
                        <label className="text-sm text-gray-400">Status do Contrato</label>
                        <select name="status_contrato" value={formData.status_contrato || 'Ativo'} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white">
                            <option>Ativo</option><option>Encerrado</option><option>Rescindido</option><option>Renovado</option>
                        </select>
                    </div>
                </div>
                {formError && <div className="text-red-400 mt-4 text-center">{formError}</div>}
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-700 text-right">
                <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 ml-2">Salvar</button>
            </div>
        </form>
    );
}