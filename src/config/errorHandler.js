

export const errorHandler = (error) => {
    if (error.response) {
        let errorMessage = '';
        if (error.response.data.Message) {
            errorMessage = error.response.data.Message ? error.response.data.Message :
                error.response.data.error_description ? error.response.data.error_description : 'Something went wrong';
            if (error.response.data.ModelState) {
                for (const key in error.response.data.ModelState) {
                    const element = error.response.data.ModelState[key];
                    errorMessage = errorMessage + ' ' + element;
                }
            }
        } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
        } else {
            errorMessage = 'Something went wrong';
        }
        return errorMessage;
    } else if (error.request) {
        return error.message;
    } else {
        return 'Something went wrong';
    }
};
