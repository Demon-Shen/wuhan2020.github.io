import * as clipboard from 'clipboard-polyfill';
import { component, mixin, createCell } from 'web-cell';
import { observer } from 'mobx-web-cell';

import { SpinnerBox } from 'boot-cell/source/Prompt/Spinner';
import { Card } from 'boot-cell/source/Content/Card';
import { Button } from 'boot-cell/source/Form/Button';
import { DropMenu } from 'boot-cell/source/Navigator/DropMenu';
import 'boot-cell/source/Content/EdgeDetector';
import { EdgeEvent } from 'boot-cell/source/Content/EdgeDetector';

import { suppliesRequirement, SuppliesRequirement } from '../../model';

interface HospitalPageState {
    loading?: boolean;
    noMore?: boolean;
}

@observer
@component({
    tagName: 'hospital-page',
    renderTarget: 'children'
})
export class HospitalPage extends mixin<{}, HospitalPageState>() {
    state = { loading: false, noMore: false };

    loadMore = async ({ detail }: EdgeEvent) => {
        if (detail !== 'bottom' || this.state.noMore) return;

        await this.setState({ loading: true });

        const data = await suppliesRequirement.getNextPage();

        await this.setState({ loading: false, noMore: !data });
    };

    async clip2board(raw: string) {
        await clipboard.writeText(raw);

        self.alert('已复制到剪贴板');
    }

    renderItem = ({
        hospital,
        supplies = [],
        address,
        contacts
    }: SuppliesRequirement) => (
        <Card className="mb-4" style={{ minWidth: '20rem' }} title={hospital}>
            <ol>
                {supplies.map(item => (
                    <li>{item}</li>
                ))}
            </ol>

            <footer className="text-center">
                <Button onClick={() => this.clip2board(address)}>
                    邮寄地址
                </Button>

                {contacts && (
                    <DropMenu
                        className="d-inline-block ml-3"
                        alignType="right"
                        title="联系方式"
                        list={contacts.map(({ name, number }) => ({
                            title: `${name}：+86-${number}`,
                            href: 'tel:+86-' + number
                        }))}
                    />
                )}
            </footer>
        </Card>
    );

    render(_, { loading, noMore }: HospitalPageState) {
        return (
            <SpinnerBox cover={loading}>
                <header className="d-flex justify-content-between align-item-center my-3">
                    <h2>医院急需物资</h2>
                    <span>
                        <Button kind="warning" href="hospital/edit">
                            需求发布
                        </Button>
                    </span>
                </header>

                <edge-detector onTouchEdge={this.loadMore}>
                    <div className="card-deck">
                        {suppliesRequirement.list.map(this.renderItem)}
                    </div>
                    <p slot="bottom" className="text-center mt-2">
                        {noMore ? '没有更多数据了' : '加载更多...'}
                    </p>
                </edge-detector>
            </SpinnerBox>
        );
    }
}
