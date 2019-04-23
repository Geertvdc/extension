import * as React from 'react';
import moment from 'moment';

import { ITableColumn, ISimpleTableCell, renderSimpleCell, SimpleTableCell, Table } from "azure-devops-ui/Table"
import { ObservableValue, ObservableArray } from 'azure-devops-ui/Core/Observable';
import { Page } from 'azure-devops-ui/Page';
import { Header, TitleSize } from 'azure-devops-ui/Header'
import { Card } from 'azure-devops-ui/Card'
import { Status, Statuses, StatusSize, IStatusProps } from "azure-devops-ui/Status";

import { IAzDoService, IBuildReport } from './services/IAzDoService';
import { sortingBehavior } from './components/TableSortingBehavior'

interface ITableItem extends ISimpleTableCell {
    pipeline: string,
    buildId: string,
    createdDate: string,
    usesFortify: IStatusProps,
    usesSonarQube: IStatusProps,
    artifactsStoredSecure: IStatusProps
}

interface IBuildProps {
    azDoService: IAzDoService
}

export default class extends React.Component<IBuildProps, { report: IBuildReport, isLoading: boolean }> {
    private itemProvider = new ObservableArray<any>();
    
    constructor(props: IBuildProps) {
        super(props);
        this.state = {
            report: {
                reports: []
            },
            isLoading: true
        }
    }

    async componentDidMount() {
        const report = await this.props.azDoService.GetReportsFromDocumentStorage<IBuildReport>("BuildReports");
        this.itemProvider.push(...report.reports.map<ITableItem>(x => ({
             pipeline: x.pipeline,
             buildId: x.id,
             createdDate: x.createdDate,
             usesFortify: x.usesFortify ? Statuses.Success : Statuses.Failed,
             usesSonarQube: x.usesSonarQube ? Statuses.Success : Statuses.Failed,
             artifactsStoredSecure: x.artifactsStoredSecure ? Statuses.Success : Statuses.Failed
        })));

        this.setState({ isLoading: false, report: report });    
    }

    private renderDate(
        _rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<ITableItem>,
        item: ITableItem
    ): JSX.Element {

        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex} >
                {moment(item.createdDate).fromNow()}
            </SimpleTableCell>
        )
    }

    private renderCheckmark(
        _rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<ITableItem>,
        item: ITableItem
    ): JSX.Element {
        let value = item[tableColumn.id] as IStatusProps;

        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex} >
                <Status
                    {...value}
                    className="icon-large-margin"
                    size={StatusSize.l}
                />
            </SimpleTableCell>
        )
    }

    render() {
        const columns: ITableColumn<ITableItem>[] = [
            {
                id: 'pipeline',
                name: "Pipeline",
                renderCell: renderSimpleCell,
                width: new ObservableValue(450),
                sortProps: {
                    ariaLabelAscending: "Sorted A to Z",
                    ariaLabelDescending: "Sorted Z to A"
                }
            },
            {
                id: 'buildId',
                name: 'Build',
                width: new ObservableValue(75),
                renderCell: renderSimpleCell,
                sortProps: {
                    ariaLabelAscending: "Sorted A to Z",
                    ariaLabelDescending: "Sorted Z to A"
                }
            },
            {
                id: 'createdDate',
                name: 'Created',
                width: new ObservableValue(130),
                renderCell: this.renderDate,
                sortProps: {
                    ariaLabelAscending: "Sorted Oldest to Newest",
                    ariaLabelDescending: "Sorted Newest to Oldest"
                }
            },
            {
                id: 'usesFortify',
                name: 'Fortify',
                width: new ObservableValue(75),
                renderCell: this.renderCheckmark,
                sortProps: {
                    ariaLabelAscending: "Sorted A to Z",
                    ariaLabelDescending: "Sorted Z to A"
                }
            },
            {
                id: 'usesSonarQube',
                name: 'SonarQube',
                width: new ObservableValue(75),
                renderCell: this.renderCheckmark,
                sortProps: {
                    ariaLabelAscending: "Sorted A to Z",
                    ariaLabelDescending: "Sorted Z to A"
                }
            },
            {
                id: 'artifactsStoredSecure',
                name: 'Artifact Secure',
                width: new ObservableValue(75),
                renderCell: this.renderCheckmark,
                sortProps: {
                    ariaLabelAscending: "Sorted A to Z",
                    ariaLabelDescending: "Sorted Z to A"
                }
            },
        ];

        return (
            <Page>
                <Header
                    title={"Build compliancy"}
                    titleSize={TitleSize.Medium}
                    titleIconProps={{ iconName: "OpenSource" }}
                />

                <div className="page-content page-content-top">
                    <p>We would ❤ getting in touch on how to improve analyzing builds and stuff, so join us on our <a href="https://confluence.dev.rabobank.nl/display/MTTAS/Sprint+Review+Menu" target="_blank">sprint review</a> @UC-T15!</p>
                    <p>More information on the <a href="https://confluence.dev.rabobank.nl/pages/viewpage.action?pageId=119243814#ApplyDevOpsSecurityBlueprintCI/CDprinciples-Build" target="_blank">how &amp; why</a> of storing artifacts secure with Azure Pipelines or <a href="https://confluence.dev.rabobank.nl/display/MTTAS/Secure+Pipelines" target="_blank">secure pipelines</a> in general.</p>
                    <p>If you still have questions or need assistance on your pipelines, create a <a href="http://tools.rabobank.nl/vsts/request" target="_blank">support request</a>.</p>
                    
                    <Card>
                        { this.state.isLoading ?
                            <div>Loading...</div> :
                            <Table<ITableItem> columns={columns}  itemProvider={this.itemProvider} behaviors={[ sortingBehavior(this.itemProvider, columns) ]} />
                        }
                    </Card>
                </div>
            </Page>

            );
    }  
}