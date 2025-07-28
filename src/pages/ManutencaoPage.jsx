import React, { useState, useEffect } from 'react';

// URL base da API (do seu arquivo .env.local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const MANUTENCAO_API_URL = `${API_BASE_URL}/api/manutencoes/`;
const IMOVEIS_API_URL = `${API_BASE_URL}/api/imoveis/`;


// =================================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =================================================================================
function ManutencaoPage() {
    // --- ESTADOS (STATE) ---
    const [manutencoes, setManutencoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'details' ou 'form'
    const [selectedManutencao, setSelectedManutencao] = useState(null);

    // --- LÓGICA DE DADOS (API) ---
    const fetchManutencoes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(MANUTENCAO_API_URL);
            if (!response.ok) throw new Error('Falha ao buscar dados da API de Manutenções.');
            const data = await response.json();
            setManutencoes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManutencoes();
    }, []);

    // --- MANIPULADORES DE EVENTOS (HANDLERS) ---
    const handleOpenDetails = (manutencao) => {
        setSelectedManutencao(manutencao);
        setModalType('details');
        setIsModalOpen(true);
    };

    const handleOpenForm = (manutencao = null) => {
        setSelectedManutencao(manutencao);
        setModalType('form');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedManutencao(null);
        setModalType(null);
    };

    const handleDelete = async (manutencaoId) => {
        if (window.confirm('Tem certeza que deseja excluir esta solicitação de manutenção?')) {
            try {
                await fetch(`${MANUTENCAO_API_URL}${manutencaoId}/`, { method: 'DELETE' });
                handleCloseModal();
                await fetchManutencoes();
            } catch (err) {
                alert(`Erro ao excluir: ${err.message}`);
            }
        }
    };

    const handleFormSuccess = () => {
        handleCloseModal();
        fetchManutencoes();
    };
    
    // --- RENDERIZAÇÃO PRINCIPAL ---
    if (error) return <div className="p-8 text-center text-red-400">Erro: {error}</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Gestão de Manutenções</h2>
                <button onClick={() => handleOpenForm(null)} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition">+ Nova Solicitação</button>
            </div>

            {loading ? <div className="text-center text-gray-500 py-10">Carregando...</div> : (
                <ManutencaoTable manutencoes={manutencoes} onOpenDetails={handleOpenDetails} />
            )}
            
            {isModalOpen && (
                <Modal onClose={handleCloseModal} title={
                    modalType === 'form' 
                        ? (selectedManutencao ? 'Editar Manutenção' : 'Adicionar Nova Manutenção') 
                        : `Detalhes da Manutenção #${selectedManutencao.id}`
                }>
                    {modalType === 'details' && (
                        <ManutencaoDetails 
                            manutencao={selectedManutencao} 
                            onEdit={() => handleOpenForm(selectedManutencao)}
                            onDelete={() => handleDelete(selectedManutencao.id)}
                            onClose={handleCloseModal}
                        />
                    )}
                    {modalType === 'form' && (
                        <ManutencaoForm 
                            manutencaoData={selectedManutencao} 
                            onSuccess={handleFormSuccess}
                            onClose={handleCloseModal}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default ManutencaoPage;

// =================================================================================
// SUB-COMPONENTES (Peças da Interface)
// =================================================================================

function ManutencaoTable({ manutencoes, onOpenDetails }) {
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-900 text-gray-400 uppercase">
                    <tr>
                        <th className="p-4">Imóvel</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Data Solicitação</th>
                        <th className="p-4">Status</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {manutencoes.map(manutencao => (
                        <tr key={manutencao.id} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="p-4 text-gray-200">{manutencao.imovel}</td>
                            <td className="p-4 text-gray-400 truncate max-w-sm">{manutencao.descricao}</td>
                            <td className="p-4 text-gray-400">{manutencao.data_solicitacao}</td>
                            <td className="p-4 text-gray-400">{manutencao.status_manutencao}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => onOpenDetails(manutencao)} className="text-orange-500 hover:text-orange-400 font-semibold">Ver Detalhes</button>
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

function ManutencaoDetails({ manutencao, onEdit, onDelete, onClose }) {
    return (
        <>
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-300">
                    {Object.entries(manutencao).map(([key, value]) => (
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

function ManutencaoForm({ manutencaoData, onSuccess, onClose }) {
    const [formData, setFormData] = useState(manutencaoData || {
        imovel_id: '',
        data_solicitacao: '',
        descricao: '',
        status_manutencao: 'Pendente',
        data_conclusao: '',
        custo_manutencao: '',
        responsavel_manutencao: ''
    });
    const [imoveis, setImoveis] = useState([]);
    const [formError, setFormError] = useState('');

    // Busca a lista de imóveis para preencher o <select>
    useEffect(() => {
        const fetchImoveis = async () => {
            try {
                const response = await fetch(IMOVEIS_API_URL);
                const data = await response.json();
                setImoveis(data);
            } catch (error) {
                console.error("Erro ao buscar imóveis:", error);
                setFormError("Não foi possível carregar a lista de imóveis.");
            }
        };
        fetchImoveis();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEditing = !!manutencaoData;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${MANUTENCAO_API_URL}${manutencaoData.id}/` : MANUTENCAO_API_URL;
        
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
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Imóvel</label>
                        <select name="imovel_id" value={formData.imovel_id || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required>
                            <option value="">-- Selecione um Imóvel --</option>
                            {imoveis.map(imovel => (
                                <option key={imovel.id} value={imovel.id}>
                                    {imovel.endereco}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Descrição do Problema</label>
                        <textarea name="descricao" value={formData.descricao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required rows="4"></textarea>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Data da Solicitação</label>
                        <input type="date" name="data_solicitacao" value={formData.data_solicitacao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Status da Manutenção</label>
                        <select name="status_manutencao" value={formData.status_manutencao || 'Pendente'} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white">
                            <option value="Pendente">Pendente</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Responsável (Empresa/Pessoa)</label>
                        <input type="text" name="responsavel_manutencao" value={formData.responsavel_manutencao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Custo da Manutenção</label>
                        <input type="number" name="custo_manutencao" value={formData.custo_manutencao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Data de Conclusão</label>
                        <input type="date" name="data_conclusao" value={formData.data_conclusao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" />
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