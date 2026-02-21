import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdministratorPage() {
    const navigate = useNavigate();

    const cards = [
        {
            title: 'Student Upload',
            buttonText: 'Go to Student Upload',
            onClick: () => navigate('/administrator/student-upload'),
            color: 'bg-blue-600 hover:bg-blue-700',
        },
        {
            title: 'Subject Upload',
            buttonText: 'Go to Subject Upload',
            onClick: () => navigate('/administrator/subject-upload'),
            color: 'bg-green-600 hover:bg-green-700',
        },
        {
            title: 'Delete Data',
            buttonText: 'Go to Delete Data',
            onClick: () => navigate('/administrator/delete-data'),
            color: 'bg-red-600 hover:bg-red-700',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 max-w-5xl w-full">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-[1.02]"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">{card.title}</h2>
                        <button
                            onClick={card.onClick}
                            className={`${card.color} text-white px-6 py-2 rounded-lg transition-colors`}
                        >
                            {card.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdministratorPage;
