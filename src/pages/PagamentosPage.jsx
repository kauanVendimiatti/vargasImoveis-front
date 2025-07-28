import React, { useState, useEffect } from 'react';

// URL base da API (do seu arquivo .env.local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const PAGAMENTOS_API_URL = `${API_BASE_URL}/api/pagamentos/`;
const CONTRATOS_API_URL = `${API_BASE_URL}/api/contratos/`;


// =================================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =================================================================================
function PagamentosPage() {
    // --- ESTADOS (STATE) ---
    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'details' ou 'form'
    const [selectedPagamento, setSelectedPagamento] = useState(null);

    // --- LÓGICA DE DADOS (API) ---
    const fetchPagamentos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(PAGAMENTOS_API_URL);
            if (!response.ok) throw new Error('Falha ao buscar dados da API de Pagamentos.');
            const data = await response.json();
            setPagamentos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPagamentos();
    }, []);

    // --- MANIPULADORES DE EVENTOS (HANDLERS) ---
    const handleOpenDetails = (pagamento) => {
        setSelectedPagamento(pagamento);
        setModalType('details');
        setIsModalOpen(true);
    };

    const handleOpenForm = (pagamento = null) => {
        setSelectedPagamento(pagamento);
        setModalType('form');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPagamento(null);
        setModalType(null);
    };

    const handleDelete = async (pagamentoId) => {
        if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
            try {
                await fetch(`${PAGAMENTOS_API_URL}${pagamentoId}/`, { method: 'DELETE' });
                handleCloseModal();
                await fetchPagamentos();
            } catch (err) {
                alert(`Erro ao excluir: ${err.message}`);
            }
        }
    };

    const handleFormSuccess = () => {
        handleCloseModal();
        fetchPagamentos();
    };
    
    // --- RENDERIZAÇÃO PRINCIPAL ---
    if (error) return <div className="p-8 text-center text-red-400">Erro: {error}</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Gestão de Pagamentos</h2>
                <button onClick={() => handleOpenForm(null)} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition">+ Novo Pagamento</button>
            </div>

            {loading ? <div className="text-center text-gray-500 py-10">Carregando...</div> : (
                <PagamentosTable pagamentos={pagamentos} onOpenDetails={handleOpenDetails} />
            )}
            
            {isModalOpen && (
                <Modal onClose={handleCloseModal} title={
                    modalType === 'form' 
                        ? (selectedPagamento ? 'Editar Pagamento' : 'Adicionar Novo Pagamento') 
                        : `Detalhes do Pagamento #${selectedPagamento.id}`
                }>
                    {modalType === 'details' && (
                        <PagamentoDetails 
                            pagamento={selectedPagamento} 
                            onEdit={() => handleOpenForm(selectedPagamento)}
                            onDelete={() => handleDelete(selectedPagamento.id)}
                            onClose={handleCloseModal}
                        />
                    )}
                    {modalType === 'form' && (
                        <PagamentoForm 
                            pagamentoData={selectedPagamento} 
                            onSuccess={handleFormSuccess}
                            onClose={handleCloseModal}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default PagamentosPage;

// =================================================================================
// SUB-COMPONENTES (Peças da Interface)
// =================================================================================

function PagamentosTable({ pagamentos, onOpenDetails }) {
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-900 text-gray-400 uppercase">
                    <tr>
                        <th className="p-4">Contrato</th>
                        <th className="p-4">Data Pag.</th>
                        <th className="p-4">Valor Pago</th>
                        <th className="p-4">Status</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {pagamentos.map(pagamento => (
                        <tr key={pagamento.id} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="p-4 text-gray-200">{pagamento.contrato}</td>
                            <td className="p-4 text-gray-400">{pagamento.data_pagamento}</td>
                            <td className="p-4 text-gray-400">R$ {parseFloat(pagamento.valor_pago).toLocaleString('pt-BR')}</td>
                            <td className="p-4 text-gray-400">{pagamento.status_pagamento}</td>
                            {/* BOTÕES DE AÇÃO ATUALIZADOS */}
                            <td className="p-4 text-right">
                                <button onClick={() => onOpenDetails(pagamento)} className="text-orange-500 hover:text-orange-400 font-semibold">Ver Detalhes</button>
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
            <div className="bg-gray-800 rounded-xl shadow-lg w-11/12 md:w-3/4 lg:w-1/2 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
}

// NOVO SUB-COMPONENTE PARA MOSTRAR DETALHES
function PagamentoDetails({ pagamento, onEdit, onDelete, onClose }) {
    return (
        <>
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-300">
                    {Object.entries(pagamento).map(([key, value]) => (
                        <div key={key}>
                            <p className="text-sm text-gray-500 font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="text-lg">{value !== null && value !== '' ? String(value) : 'N/A'}</p>
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

function PagamentoForm({ pagamentoData, onSuccess, onClose }) {
    const [formData, setFormData] = useState(pagamentoData || {
        contrato_id: '', data_pagamento: '', valor_pago: '',
        multa_juros: '', forma_pagamento: 'PIX', status_pagamento: 'Pendente',
        comprovante_pagamento: ''
    });
    const [contratos, setContratos] = useState([]);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const fetchContratos = async () => {
            try {
                const response = await fetch(CONTRATOS_API_URL);
                const data = await response.json();
                setContratos(data);
            } catch (error) {
                console.error("Erro ao buscar contratos:", error);
                setFormError("Não foi possível carregar a lista de contratos.");
            }
        };
        fetchContratos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEditing = !!pagamentoData;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${PAGAMENTOS_API_URL}${pagamentoData.id}/` : PAGAMENTOS_API_URL;
        
        const cleanedData = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v]));

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleanedData) });
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
                    <div>
                        <label className="text-sm text-gray-400">Contrato</label>
                        <select name="contrato_id" value={formData.contrato_id || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required>
                            <option value="">-- Selecione um Contrato --</option>
                            {contratos.map(contrato => (
                                <option key={contrato.id} value={contrato.id}>
                                    Contrato #{contrato.id} ({contrato.imovel})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Data do Pagamento</label>
                        <input type="date" name="data_pagamento" value={formData.data_pagamento || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Valor Pago</label>
                        <input type="number" name="valor_pago" value={formData.valor_pago || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required step="0.01" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Multa / Juros</label>
                        <input type="number" name="multa_juros" value={formData.multa_juros || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Forma de Pagamento</label>
                        <select name="forma_pagamento" value={formData.forma_pagamento || 'PIX'} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white">
                            <option value="PIX">PIX</option>
                            <option value="Boleto">Boleto</option>
                            <option value="Transferência Bancária">Transferência Bancária</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Status do Pagamento</label>
                        <select name="status_pagamento" value={formData.status_pagamento || 'Pendente'} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white">
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                            <option value="Em Atraso">Em Atraso</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">URL do Comprovante (Opcional)</label>
                        <input type="text" name="comprovante_pagamento" value={formData.comprovante_pagamento || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" />
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