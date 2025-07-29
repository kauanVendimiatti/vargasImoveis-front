import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// =================================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =================================================================================
function PessoasPage() {
    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'details' ou 'form'
    const [selectedPessoa, setSelectedPessoa] = useState(null);

    const fetchPessoas = async () => {
        setLoading(true);
        setError(null);
        try {
            // Endpoints para cada tipo de pessoa
            const endpoints = [
                { type: 'locadores', name: 'Locador' },
                { type: 'locatarios', name: 'Locatário' },
                { type: 'fiadores', name: 'Fiador' },
                { type: 'intermediarios', name: 'Intermediário' },
            ];

            // Busca os dados de todos os endpoints em paralelo
            const promises = endpoints.map(ep => 
                fetch(`${API_BASE_URL}/api/${ep.type}/`).then(res => res.json())
            );
            
            const results = await Promise.all(promises);
            
            // Junta todos os resultados em uma única lista, adicionando o tipo a cada objeto
            let allPessoas = [];
            results.forEach((data, index) => {
                const typedData = data.map(item => ({
                    ...item,
                    personType: endpoints[index].type, // ex: 'locadores'
                    typeName: endpoints[index].name,   // ex: 'Locador'
                }));
                allPessoas = [...allPessoas, ...typedData];
            });

            setPessoas(allPessoas);
        } catch (err) {
            setError('Falha ao buscar dados das pessoas. Verifique se a API está funcionando.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPessoas();
    }, []);

    const handleOpenDetails = (pessoa) => {
        setSelectedPessoa(pessoa);
        setModalType('details');
        setIsModalOpen(true);
    };

    const handleOpenForm = (pessoa = null) => {
        setSelectedPessoa(pessoa);
        setModalType('form');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPessoa(null);
        setModalType(null);
    };

    const handleFormSuccess = () => {
        handleCloseModal();
        fetchPessoas();
    };

    if (error) return <div className="p-8 text-center text-red-400">Erro: {error}</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Gestão de Pessoas</h2>
                <button onClick={() => handleOpenForm(null)} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition">+ Nova Pessoa</button>
            </div>

            {loading ? <div className="text-center text-gray-500 py-10">Carregando...</div> : (
                <PessoasTable pessoas={pessoas} onOpenDetails={handleOpenDetails} />
            )}
            
            {isModalOpen && (
                <Modal onClose={handleCloseModal} title={
                    modalType === 'form' 
                        ? (selectedPessoa ? `Editar ${selectedPessoa.typeName}` : 'Adicionar Nova Pessoa') 
                        : `Detalhes de ${selectedPessoa.typeName}`
                }>
                    {modalType === 'details' && (
                        <PessoaDetails 
                            pessoa={selectedPessoa} 
                            onEdit={() => handleOpenForm(selectedPessoa)}
                            onDeleteSuccess={handleFormSuccess}
                            onClose={handleCloseModal}
                        />
                    )}
                    {modalType === 'form' && (
                        <PessoaForm 
                            pessoaData={selectedPessoa} 
                            onSuccess={handleFormSuccess}
                            onClose={handleCloseModal}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default PessoasPage;

// =================================================================================
// SUB-COMPONENTES
// =================================================================================

function PessoasTable({ pessoas, onOpenDetails }) {
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-900 text-gray-400 uppercase">
                    <tr>
                        <th className="p-4">Nome</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Telefone</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {pessoas.map(pessoa => (
                        <tr key={`${pessoa.personType}-${pessoa.id}`} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="p-4 text-gray-200">{pessoa.nome}</td>
                            <td className="p-4 text-gray-400">{pessoa.typeName}</td>
                            <td className="p-4 text-gray-400">{pessoa.email}</td>
                            <td className="p-4 text-gray-400">{pessoa.telefone}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => onOpenDetails(pessoa)} className="text-orange-500 hover:text-orange-400 font-semibold">Ver Detalhes</button>
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

function PessoaDetails({ pessoa, onEdit, onDeleteSuccess, onClose }) {
    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja excluir ${pessoa.typeName} ${pessoa.nome}?`)) {
            const API_ENDPOINT = `${API_BASE_URL}/api/${pessoa.personType}/${pessoa.id}/`;
            try {
                const response = await fetch(API_ENDPOINT, { method: 'DELETE' });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Falha ao excluir.');
                }
                onDeleteSuccess();
            } catch (err) {
                alert(`Erro: ${err.message}`);
            }
        }
    };

    return (
         <>
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-300">
                    {Object.entries(pessoa).map(([key, value]) => {
                        if (key === 'personType' || key === 'typeName') return null; // Não exibe campos internos
                        return (
                            <div key={key}>
                                <p className="text-sm text-gray-500 font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
                                <p className="text-lg">{String(value) || 'N/A'}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-700 flex justify-between items-center">
                <button onClick={handleDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Deletar</button>
                <div>
                    <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 mr-2">Fechar</button>
                    <button onClick={onEdit} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600">Editar</button>
                </div>
            </div>
        </>
    );
}

// O formulário unificado que você já tinha, agora dentro do modal
function PessoaForm({ pessoaData, onSuccess, onClose }) {
    const [personType, setPersonType] = useState(pessoaData?.personType || 'locadores');
    const [tipoPessoa, setTipoPessoa] = useState(pessoaData?.tipo_pessoa || 'Física');
    const [formData, setFormData] = useState(pessoaData || { nome: '', email: '', telefone: '', cpf_cnpj: '', endereco: '', dados_bancarios: '', profissao: '' });
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        const isEditing = !!pessoaData;
        const API_ENDPOINT = `${API_BASE_URL}/api/${personType}/${isEditing ? pessoaData.id + '/' : ''}`;
        const method = isEditing ? 'PUT' : 'POST';
        
        const dataToSubmit = { ...formData, tipo_pessoa: tipoPessoa };

        try {
            const response = await fetch(API_ENDPOINT, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSubmit) });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(JSON.stringify(errData));
            }
            onSuccess();
        } catch (err) {
            setMessage(`Erro: ${err.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                {message && <p className="text-red-400 mb-4">{message}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-gray-400">Tipo de Pessoa</label>
                        <select value={personType} onChange={(e) => setPersonType(e.target.value)} disabled={!!pessoaData} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white disabled:opacity-50">
                            <option value="locadores">Locador</option>
                            <option value="locatarios">Locatário</option>
                            <option value="fiadores">Fiador</option>
                            <option value="intermediarios">Intermediário</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Natureza</label>
                        <select value={tipoPessoa} onChange={(e) => setTipoPessoa(e.target.value)} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white">
                            <option>Física</option>
                            <option>Jurídica</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Nome Completo / Razão Social</label>
                        <input type="text" name="nome" value={formData.nome || ''} onChange={handleInputChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">{tipoPessoa === 'Física' ? 'CPF' : 'CNPJ'}</label>
                        <input type="text" name="cpf_cnpj" value={formData.cpf_cnpj || ''} onChange={handleInputChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Profissão</label>
                        <input type="text" name="profissao" value={formData.profissao || ''} onChange={handleInputChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">E-mail</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Telefone</label>
                        <input type="text" name="telefone" value={formData.telefone || ''} onChange={handleInputChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Endereço</label>
                        <input type="text" name="endereco" value={formData.endereco || ''} onChange={handleInputChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-700 text-right">
                <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 ml-2">Salvar</button>
            </div>
        </form>
    );
}