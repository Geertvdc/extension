import * as React from "react";
import { Card } from "azure-devops-ui/Card";
import { IObservableValue, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IListItemDetails, List, ListItem, ListSelection } from "azure-devops-ui/List";
import { DetailsPanel, MasterPanel, MasterPanelHeader } from "azure-devops-ui/MasterDetails";
import {
    BaseMasterDetailsContext,
    bindSelectionToObservable,
    IMasterDetailsContext,
    IMasterDetailsContextLayer,
    MasterDetailsContext
} from "azure-devops-ui/MasterDetailsContext";
import { Page } from "azure-devops-ui/Page";
import {
    ITableColumn,
    Table} from "azure-devops-ui/Table";
import { TextField } from "azure-devops-ui/TextField";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { renderString, renderCheckmark } from "./TableRenderers";
import { IStatusProps, Statuses } from "azure-devops-ui/Status";

interface IReportMaster {
    item: string,
    rules: IReportDetail[]
}

interface IReportDetail {
    description: string,
    status: IStatusProps
}

export default class extends React.Component<{ data: { item: string, rules:{ description: string, status: boolean }[] }[] }, {}> {
    private data: Array<IReportMaster> = this.props.data.map(m => {
        let master: IReportMaster = {
            item: m.item,
            rules: m.rules.map(r => {
                let rule: IReportDetail = {
                    description: r.description,
                    status: r.status ? Statuses.Success : Statuses.Failed
                }
                return rule;
            })
        };
        return master;
    });
    
    constructor(props: any) {
        super(props);
        console.log(this.data);
    }

    private initialPayload: IMasterDetailsContextLayer<IReportMaster, undefined> = {
        key: "initial",
        masterPanelContent: {
            renderContent: (parentItem, initialSelectedMasterItem) => (
                <this.InitialMasterPanelContent  initialSelectedMasterItem={initialSelectedMasterItem} />
            ),
            renderHeader: () => <MasterPanelHeader title={"Repositories"} />,
            renderSearch: () => (
                <TextField prefixIconProps={{ iconName: "Search" }} placeholder="Search doesn't work" />
            ),
            hideBackButton: false //somehow this HIDES the back button
        },
        detailsContent: {
            renderContent: item => <this.InitialDetailView detailItem={item} />
        },
        selectedMasterItem: new ObservableValue<IReportMaster>(this.data[0]),
        parentItem: undefined
    };

    private InitialMasterPanelContent: React.FunctionComponent<{
        initialSelectedMasterItem: IObservableValue<IReportMaster>;
    }> = props => {
        const [initialItemProvider] = React.useState(new ArrayItemProvider(this.data));
        const [initialSelection] = React.useState(new ListSelection());
    
        React.useEffect(() => {
            bindSelectionToObservable(
                initialSelection,
                initialItemProvider,
                props.initialSelectedMasterItem
            );
        });
    
        return (
            <List
                itemProvider={initialItemProvider}
                selection={initialSelection}
                renderRow={this.renderInitialRow}
                width="100%"
            />
        );
    };

    private renderInitialRow = (
        index: number,
        item: IReportMaster,
        details: IListItemDetails<IReportMaster>,
        key?: string
    ): JSX.Element => {
        return (
            <ListItem
                className="master-example-row"
                key={key || "list-item" + index}
                index={index}
                details={details}
            >
                <div className="flex-row flex-center h-scroll-hidden" style={{ padding: "10px 0px" }}>
                    <div className="flex-noshrink" style={{ width: "32px" }} />
                    <div className="flex-column flex-shrink" style={{ minWidth: 0 }}>
                        <div className="primary-text text-ellipsis">{item.item}</div>
                        <div className="secondary-text">{"Optional Subtitle"}</div>
                    </div>
                </div>
            </ListItem>
        );
    };

    private InitialDetailView: React.FunctionComponent<{
        detailItem: IReportMaster;
    }> = props => {
        const { detailItem } = props;
    
        const columns: ITableColumn<IReportDetail>[] = [
            {
                id: "description",
                name: "Description",
                width: new ObservableValue(450),
                renderCell: renderString
            },
            { id: "status", name: "Status", width: new ObservableValue(75), renderCell: renderCheckmark }
        ];
    
        return (
            <Page>
                <Header
                    description={"Optional subtitle"}
                    title={detailItem.item}
                    titleSize={TitleSize.Large}
                />
                <div className="page-content page-content-top">
                    <Card
                        className="bolt-card-no-vertical-padding"
                        contentProps={{ contentPadding: false }}
                    >
                        <Table<IReportDetail>
                            columns={columns}
                            itemProvider={new ArrayItemProvider<IReportDetail>(detailItem.rules)}
                            showLines={true}
                        />
                    </Card>
                </div>
            </Page>
        );
    };

    private masterDetailsContext: IMasterDetailsContext = new BaseMasterDetailsContext(
        this.initialPayload,
        () => {
        }
    );

    render() {
        return (
            <MasterDetailsContext.Provider value={this.masterDetailsContext}>
                <div className="flex-row" style={{ width: "100%" }}>
                    <MasterPanel />
                    <DetailsPanel />
                </div>
            </MasterDetailsContext.Provider>
        );
    }
}