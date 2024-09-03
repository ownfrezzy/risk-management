
const cds = require('@sap/cds')

module.exports = cds.service.impl(async function() {

    const { Risks, BusinessPartners } = this.entities;

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
  });