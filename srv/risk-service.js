
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

            // set criticality for priority
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
        console.log('HERE')
        const { exactQuantity } = req.data;
        const query = SELECT.from(Items).where({ quantity: exactQuantity });
        const items = await cds.run(query);

        return items;
    })

    this.on('createItem', async (req) => {
        console.log('HERE')

        const { title, descr, quantity } = req.data;

        const newItem = {
            title,
            descr,
            quantity,
        };

        const query = INSERT.into(Items).entries(newItem)

        const result = await cds.run(query);

        return result;
    });
  });