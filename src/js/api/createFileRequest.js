const createFileRequest = async (data) => {
    const postOptions = {
        method: 'POST',
        body: data,
    };
    
    try {
        const response = await fetch('http://localhost:7070/api/messages/file', postOptions);

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const errorText = await response.text(); // Получаем текст ошибки
            console.error('Error:', response.status, response.statusText, errorText);
            return null; // Возвращаем null в случае ошибки
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return null; // Возвращаем null при ошибке сети
    }
};

export default createFileRequest;