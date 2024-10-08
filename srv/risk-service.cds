using {riskmanagement as rm} from '../db/schema';

@path: 'service/risk'
service RiskService {
        entity Risks @(restrict: [
        {
            grant: 'READ',
            to   : 'RiskViewer'
        },
        {
            grant: [
                'READ',
                'WRITE',
                'UPDATE',
                'UPSERT',
                'DELETE'
            ],
            to   : 'RiskManager'
        }
    ])                      as projection on rm.Risks;

    annotate Risks with @odata.draft.enabled;

    entity Mitigations @(restrict: [
        {
            grant: 'READ',
            to   : 'RiskViewer'
        },
        {
            grant: '*',
            to   : 'RiskManager'
        }
    ])                      as projection on rm.Mitigations;

    annotate Mitigations with @odata.draft.enabled;

    @readonly
    entity BusinessPartners as projection on rm.BusinessPartners;

    entity Items as projection on rm.Items;
    function getItems(quantity: Integer) returns Array of Items;
    action createItem(title: String, descr: String, quantity: Integer) returns Items;

    function callLocalhost() returns String;
}
