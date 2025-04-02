const parseSchemaErrors = (err) => {
    let errors = [];
    if (err.name === 'ValidationError') {
        for (const field in err.errors) {
            errors.push(err.errors[field].message);
        }
    } else {
        return [err.message];
    }
    return errors;
}

module.exports = {parseSchemaErrors}
