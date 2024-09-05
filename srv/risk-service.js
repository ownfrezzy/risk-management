
const cds = require('@sap/cds')

module.exports = cds.service.impl(async function() {

    const { Risks, BusinessPartners, Items } = this.entities;

    this.after("READ", Risks, (data) => {
        const risks = Array.isArray(data) ? data : [data];

        risks.forEach((risk) => {
            if( risk.impact >= 100000) {
                risk.criticality = 1;
            } else {
                risk.criticality = 2;
            }

            switch (risk.prio_code) {
                case 'H':
                    risk.PrioCriticality = 1;
                    break;
                case 'M':
                    risk.PrioCriticality = 2;
                    break;
                case 'L':
                    risk.PrioCriticality = 3;
                    break;
                default:
                    break;
            }

        })
    })

    this.on('getItems', async (req) => {
        const { quantity } = req.data;

        const query = SELECT.from(Items).where({ quantity: quantity });
        const items = await cds.run(query);

        return items;
    })

    this.on('createItem', async (req) => {
        const { title, descr, quantity } = req.data;

        const newItem = {
            title,
            descr,
            quantity,
        };

        try {
        const query = INSERT.into(Items).entries(newItem);
        await cds.run(query);

        const getCreatedItemQuery = SELECT.one.from(Items).where({ title: title, descr: descr }).orderBy({ ID: 'desc' })
        const createdItem = await cds.run(getCreatedItemQuery);

        return createdItem;
    } catch (e) {
        console.log('An error occured on createItem action');

        throw e;
    }
    });

    this.before('createItem', (req) => {
        const { quantity } = req.data;

        if (quantity > 100) req.error("Quantity can't exceed 100")
    })

    this.on('error', (e, req) => {
        console.log(e.message || 'On error handler invoked')
        console.log('\x1b[36m%s\x1b[0m', 'Hayah', JSON.stringify(req.data))
    })
  });