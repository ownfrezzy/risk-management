
const cds = require('@sap/cds')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');

module.exports = cds.service.impl(async function() {
    const { Risks, BusinessPartners, Items } = this.entities;
    const BPsrv = await cds.connect.to("API_BUSINESS_PARTNER");


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

    this.on("READ", Risks, async (req, next) => {
        if (!req.query.SELECT.columns) return next();

        const expandIndex = req.query.SELECT.columns.findIndex(
            ({ expand, ref }) => expand && ref[0] === "bp"
        );

        if (expandIndex < 0) return next();

        req.query.SELECT.columns.splice(expandIndex, 1);

        if (!req.query.SELECT.columns.find((column) =>
            column.ref.find((ref) => ref == "bp_BusinessPartner")
        )
        ) {
            req.query.SELECT.columns.push({ ref: ["bp_BusinessPartner"] });
        }

        const risks = await next();

        const asArray = x => Array.isArray(x) ? x : [x];

        const bpIDs = asArray(risks).map(risk => risk.bp_BusinessPartner);
        const busienssPartners = await BPsrv.transaction(req).send({
            query: SELECT.from(this.entities.BusinessPartners).where({ BusinessPartner: bpIDs }),
            headers: {
                apikey: 'elbpliqgZibHHuGTkGKOZcGyklrk8tRH',
            }
        });

        const bpMap = {};
        for (const businessPartner of busienssPartners)
            bpMap[businessPartner.BusinessPartner] = businessPartner;

        for (const note of asArray(risks)) {
            note.bp = bpMap[note.bp_BusinessPartner];
        }

        return risks;
    });

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

    this.on("READ", BusinessPartners, async (req) => {
        req.query.where("LastName <> '' and FirstName <> '' ");

        return await BPsrv.transaction(req).send({
            query: req.query,
            headers: {
                apikey: process.env.apikey,
            },
        });
    });

    this.on('callLocalhost', async () => {
        try {
            const response = await executeHttpRequest({ destinationName: 'MyLocalServer1' }, {
              method: 'GET',
              url: '/',
            });

            // const response = await destination.get('/');
      
            return response.data;
        } catch (error) {
          console.error('Error calling local server:', error);
          throw new Error('Failed to reach local server');
        }
      });

    this.on('error', (e, req) => {
        console.log(e.message || 'On error handler invoked')
        console.log('\x1b[36m%s\x1b[0m', 'Hayah', JSON.stringify(req.data))
    })
  });